import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../types';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @route GET /api/integrations
 * @desc Get all available integrations
 * @access Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('Fetching integrations...');
    
    // Get all integrations
    const integrations = await prisma.integration.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('Found integrations:', integrations);

    // Get Twilio config
    const twilioConfig = await prisma.twilioConfig.findFirst();

    // Get Resend config
    const resendConfig = await prisma.resendConfig.findFirst();

    // Map integrations with their configuration status
    const integrationsWithStatus = integrations.map((integration) => {
      let status = "disconnected";
      
      if (integration.name === "Twilio") {
        if (twilioConfig && twilioConfig.integrationId === integration.id) {
          status = twilioConfig.enabled ? "connected" : "configuring";
        }
      } else if (integration.name === "Resend") {
        if (resendConfig && resendConfig.integrationId === integration.id) {
          status = resendConfig.enabled ? "connected" : "configuring";
        }
      } else if (integration.isEnabled) {
        status = "connected";
      }

      return {
        ...integration,
        status,
        isEnabled: integration.isEnabled
      };
    });

    return res.json(integrationsWithStatus);
  } catch (error) {
    console.error('Error in GET /integrations:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch integrations',
      details: error.message 
    });
  }
});

/**
 * @route GET /api/integrations/:id
 * @desc Get a single integration by ID
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const integration = await prisma.integration.findUnique({
      where: { id }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    return res.json(integration);
  } catch (error) {
    console.error('Error fetching integration:', error);
    return res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

/**
 * @route PUT /api/integrations/:id/toggle
 * @desc Toggle an integration's enabled status
 * @access Private
 */
router.put('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const integration = await prisma.integration.findUnique({
      where: { id }
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const updatedIntegration = await prisma.integration.update({
      where: { id },
      data: { isEnabled: !integration.isEnabled }
    });

    return res.json(updatedIntegration);
  } catch (error) {
    console.error('Error toggling integration:', error);
    return res.status(500).json({ error: 'Failed to toggle integration' });
  }
});

export default router; 