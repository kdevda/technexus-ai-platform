import express, { Router, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { validateRequest } from 'twilio/lib/webhooks/webhooks';
import { AuthRequest, AuthRequestHandler } from '../types';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/x-www-form-urlencoded' }), (req, res) => {
  console.log('Webhook received:', {
    body: req.body,
    headers: req.headers
  });

  // Validate the request is coming from Twilio
  const twilioSignature = req.headers['x-twilio-signature'] as string;
  const url = process.env.TWILIO_WEBHOOK_URL; // Your full ngrok URL
  const params = req.body;

  const isValid = validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    twilioSignature,
    url!,
    params
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Handle the incoming message
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message('Received your message!');

  res.type('text/xml');
  res.send(twiml.toString());
});

const getCurrentConfig: AuthRequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Your existing logic
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getToken: AuthRequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    // Your existing logic
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Route definitions
router.get('/config/current', authMiddleware as AuthRequestHandler, getCurrentConfig);
router.get('/token', authMiddleware as AuthRequestHandler, getToken);

export default router; 