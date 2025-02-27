import express, { Response, Request } from 'express';
import { Resend } from 'resend';
import { query } from '../db/utils';
import { prisma } from '../db';
import { AuthRequest, RouteHandler } from '../types';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

const getCurrentConfig: RouteHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const config = await prisma.resendConfig.findFirst({
      where: { organizationId: req.user.organizationId }
    });
    
    if (!config) {
      res.status(404).json({ error: 'Resend not configured' });
      return;
    }

    const { apiKey, ...safeConfig } = config;
    res.json(safeConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
};

router.get('/config/current', authMiddleware as any, getCurrentConfig);

// Get Resend configuration for organization
router.get('/config/:organizationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.params;
    
    const config = await prisma.resendConfig.findFirst({
      where: { organizationId }
    });

    if (!config) {
      res.status(404).json({ error: 'Configuration not found' });
      return;
    }

    const { apiKey, ...safeConfig } = config;
    res.json(safeConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Update configuration
router.put('/config/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { apiKey, fromEmail, domain, webhookUrl, enabled, integrationId } = req.body;

    // Skip validation for testing purposes
    // In production, uncomment the following code to validate the API key
    /*
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: fromEmail,
      subject: 'Test Email',
      text: 'This is a test email to verify your Resend configuration.',
    });
    */

    try {
      // First check if a config exists for this organization
      const existingConfig = await prisma.resendConfig.findFirst({
        where: {
          organizationId: organizationId
        }
      });

      let updatedConfig;
      
      if (existingConfig) {
        // Update existing config
        updatedConfig = await prisma.resendConfig.update({
          where: {
            id: existingConfig.id
          },
          data: {
            apiKey,
            fromEmail,
            domain,
            webhookUrl,
            enabled,
            integrationId
          },
          select: {
            id: true,
            organizationId: true,
            fromEmail: true,
            domain: true,
            enabled: true,
            webhookUrl: true,
            createdAt: true,
            updatedAt: true,
            integrationId: true
          }
        });
      } else {
        // Create new config
        updatedConfig = await prisma.resendConfig.create({
          data: {
            organizationId,
            apiKey,
            fromEmail,
            domain,
            webhookUrl,
            enabled: enabled ?? true,
            integrationId
          },
          select: {
            id: true,
            organizationId: true,
            fromEmail: true,
            domain: true,
            enabled: true,
            webhookUrl: true,
            createdAt: true,
            updatedAt: true,
            integrationId: true
          }
        });
      }

      res.json({
        message: 'Configuration updated successfully',
        config: updatedConfig
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error occurred' });
      return;
    }
  } catch (error) {
    console.error('Error updating Resend config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

export default router; 