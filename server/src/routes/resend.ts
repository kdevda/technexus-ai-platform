import express from 'express';
import { prisma } from '../db';
import { Resend } from 'resend';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Get Resend configuration
router.get('/config', async (req: AuthenticatedRequest, res) => {
  try {
    const config = await prisma.resendConfig.findFirst({
      select: {
        id: true,
        fromEmail: true,
        domain: true,
        enabled: true,
        webhookUrl: true,
        createdAt: true,
        updatedAt: true,
        integrationId: true
      }
    });

    res.json(config);
  } catch (error) {
    console.error('Error fetching Resend config:', error);
    res.status(500).json({ message: 'Failed to fetch Resend configuration' });
  }
});

// Update Resend configuration
router.put('/config', async (req: AuthenticatedRequest, res) => {
  try {
    const { apiKey, fromEmail, domain, webhookUrl, enabled, integrationId } = req.body;

    const config = await prisma.resendConfig.findFirst();

    if (!config) {
      // Create new config
      const newConfig = await prisma.resendConfig.create({
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
          fromEmail: true,
          domain: true,
          enabled: true,
          webhookUrl: true,
          createdAt: true,
          updatedAt: true,
          integrationId: true
        }
      });

      return res.json(newConfig);
    }

    // Update existing config
    const updatedConfig = await prisma.resendConfig.update({
      where: { id: config.id },
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
        fromEmail: true,
        domain: true,
        enabled: true,
        webhookUrl: true,
        createdAt: true,
        updatedAt: true,
        integrationId: true
      }
    });

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating Resend config:', error);
    res.status(500).json({ message: 'Failed to update Resend configuration' });
  }
});

// Send email
router.post('/send', async (req: AuthenticatedRequest, res) => {
  try {
    const { to, subject, html } = req.body;

    const config = await prisma.resendConfig.findFirst();

    if (!config || !config.enabled) {
      return res.status(400).json({ message: 'Resend is not configured or enabled' });
    }

    const resend = new Resend(config.apiKey);

    const result = await resend.emails.send({
      from: config.fromEmail,
      to,
      subject,
      html
    });

    res.json(result);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

export default router; 