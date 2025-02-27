import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.middleware';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Schema for organization creation/update
const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
});

// Test endpoint - no authentication required
router.get('/test', async (_req, res) => {
  try {
    console.log('Test endpoint called');
    const testData = {
      success: true,
      message: 'Organization API is working',
      testData: [
        { id: 'test1', name: 'Test Organization 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'test2', name: 'Test Organization 2', createdAt: new Date(), updatedAt: new Date() }
      ]
    };
    console.log('Sending test data:', testData);
    return res.json(testData);
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get all organizations
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('Get all organizations endpoint called');
    console.log('User role:', req.user?.role);
    
    // Allow all authenticated users to see organizations
    // For non-admin users, only show their own organization
    let organizations;
    
    if (req.user?.role === 'admin') {
      console.log('Admin user - fetching all organizations');
      organizations = await prisma.organization.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      console.log('Non-admin user - fetching only their organization');
      // For non-admin users, only return their own organization
      const userOrg = await prisma.organization.findUnique({
        where: { id: req.user?.organizationId }
      });
      organizations = userOrg ? [userOrg] : [];
    }

    // Log the response for debugging
    console.log('Sending organizations response:', organizations);

    // Ensure we're sending an array
    return res.json(Array.isArray(organizations) ? organizations : []);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get organization by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user has access to this organization
    if (req.user?.role !== 'admin' && req.user?.organizationId !== id) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    return res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new organization
router.post(
  '/',
  authMiddleware,
  validateRequest(organizationSchema),
  async (req: AuthRequest, res) => {
    try {
      // Only allow admin users to create organizations
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      const { name } = req.body;

      const organization = await prisma.organization.create({
        data: {
          name,
        },
      });

      return res.status(201).json(organization);
    } catch (error) {
      console.error('Error creating organization:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Update an organization
router.put(
  '/:id',
  authMiddleware,
  validateRequest(organizationSchema),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Only allow admin users to update organizations
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      // Check if organization exists
      const existingOrg = await prisma.organization.findUnique({
        where: { id },
      });

      if (!existingOrg) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      const updatedOrganization = await prisma.organization.update({
        where: { id },
        data: {
          name,
        },
      });

      return res.json(updatedOrganization);
    } catch (error) {
      console.error('Error updating organization:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Delete an organization
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Only allow admin users to delete organizations
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if organization has users
    const usersCount = await prisma.user.count({
      where: { organizationId: id },
    });

    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete organization with existing users. Please remove all users first.' 
      });
    }

    // Delete related configs first
    await prisma.twilioConfig.deleteMany({
      where: { organizationId: id },
    });

    await prisma.resendConfig.deleteMany({
      where: { organizationId: id },
    });

    // Delete the organization
    await prisma.organization.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting organization:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 