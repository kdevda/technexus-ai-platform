import express, { Request, Response } from 'express';
import { query } from '../db/utils';
import { prisma } from '../db';
import { AuthRequest, RouteHandler } from '../types';
import twilio from 'twilio';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleApiError } from '../utils/errorHandler';
import { validateRequest } from 'twilio/lib/webhooks/webhooks';
import { wss } from '../index';

const router = express.Router();

const getCurrentConfig: RouteHandler = async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.twilioConfig.findFirst();
    
    if (!config) {
      res.status(404).json({ error: 'Twilio not configured' });
      return;
    }

    // Extract the authToken from the config and return everything else
    const { authToken, ...safeConfig } = config;
    
    // Include apiKeySid in the response if it exists
    const responseConfig = {
      ...safeConfig,
      // If apiKeySid exists in the database but not in the type, add it manually
      ...(config as any).apiKeySid ? { apiKeySid: (config as any).apiKeySid } : {}
    };
    
    res.json(responseConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
};

const getToken: RouteHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const config = await prisma.twilioConfig.findFirst();

    if (!config || !config.enabled) {
      res.status(400).json({ error: 'Twilio not configured or disabled' });
      return;
    }

    console.log('Generating Twilio token for user:', req.user.id);
    
    try {
      // Set cache control headers to prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Create an access token using the correct approach according to Twilio docs
      // https://www.twilio.com/docs/voice/client/javascript/device
      const identity = req.user.id.toString();
      
      // For Twilio Client SDK, we need to use the accountSid as both the account and the API key
      // This is a temporary solution - in production, you should create a proper API Key in the Twilio console
      const twilioAccountSid = config.accountSid;
      // Use the API Key SID if available, otherwise fall back to accountSid
      const apiKeySid = (config as any).apiKeySid || config.accountSid;
      const twilioAuthToken = config.authToken;
      
      console.log('Using Account SID:', twilioAccountSid);
      console.log('Using API Key SID:', apiKeySid);
      console.log('Using TwiML App SID:', config.twimlAppSid || 'Not configured');
      
      // Create the access token with the required parameters
      const accessToken = new twilio.jwt.AccessToken(
        twilioAccountSid,  // Account SID
        apiKeySid,         // API Key SID (using apiKeySid if available, otherwise accountSid)
        twilioAuthToken,   // API Key Secret (using authToken as a workaround)
        { identity: identity, ttl: 3600 }  // Options with TTL of 1 hour
      );
      
      // Create a Voice grant for this token
      const voiceGrant = new twilio.jwt.AccessToken.VoiceGrant({
        outgoingApplicationSid: config.twimlAppSid || undefined,
        incomingAllow: true
      });
      
      // Add the grant to the token
      accessToken.addGrant(voiceGrant);
      
      // Serialize the token as a JWT
      const token = accessToken.toJwt();

      console.log('Twilio token generated successfully for identity:', identity);
      console.log('Token length:', token.length);
      res.json({ token });
    } catch (tokenError) {
      console.error('Error creating Twilio token:', tokenError);
      if (tokenError instanceof Error) {
        console.error('Error name:', tokenError.name);
        console.error('Error message:', tokenError.message);
        console.error('Error stack:', tokenError.stack);
      }
      res.status(500).json({ error: 'Failed to generate Twilio token: ' + (tokenError as Error).message });
    }
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

router.get('/config/current', authMiddleware as any, getCurrentConfig);
router.get('/token', authMiddleware as any, getToken);

// Get Twilio configuration
router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await prisma.twilioConfig.findFirst();

    if (!config) {
      res.status(404).json({ error: 'Configuration not found' });
      return;
    }

    const { authToken, ...safeConfig } = config;
    res.json(safeConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Update configuration
router.put('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountSid, authToken, apiKeySid, phoneNumbers, webhookUrl, twimlAppSid, enabled, integrationId } = req.body;

    // Validate required fields
    if (!accountSid || !authToken) {
      res.status(400).json({ error: 'Account SID and Auth Token are required' });
      return;
    }

    // Validate phone numbers array
    if (!Array.isArray(phoneNumbers)) {
      res.status(400).json({ error: 'Phone numbers must be an array' });
      return;
    }

    try {
      // First check if a config exists
      const existingConfig = await prisma.twilioConfig.findFirst();

      let updatedConfig;
      
      if (existingConfig) {
        // Update existing config
        updatedConfig = await prisma.twilioConfig.update({
          where: {
            id: existingConfig.id
          },
          data: {
            accountSid,
            authToken,
            // Use type assertion to avoid TypeScript errors
            ...(apiKeySid && { apiKeySid } as any),
            phoneNumbers,
            webhookUrl,
            twimlAppSid,
            enabled,
            integrationId
          },
          select: {
            id: true,
            phoneNumbers: true,
            enabled: true,
            webhookUrl: true,
            twimlAppSid: true,
            // Use type assertion to avoid TypeScript errors
            ...(apiKeySid && { apiKeySid: true } as any),
            createdAt: true,
            updatedAt: true
          }
        });
      } else {
        // Create new config
        updatedConfig = await prisma.twilioConfig.create({
          data: {
            accountSid,
            authToken,
            // Use type assertion to avoid TypeScript errors
            ...(apiKeySid && { apiKeySid } as any),
            phoneNumbers,
            webhookUrl,
            twimlAppSid,
            enabled,
            integrationId
          },
          select: {
            id: true,
            phoneNumbers: true,
            enabled: true,
            webhookUrl: true,
            twimlAppSid: true,
            // Use type assertion to avoid TypeScript errors
            ...(apiKeySid && { apiKeySid: true } as any),
            createdAt: true,
            updatedAt: true
          }
        });
      }

      res.json({
        message: 'Configuration updated successfully',
        config: updatedConfig
      });
    } catch (error: any) {
      console.error('Database error:', error);
      handleApiError(res, error, 'Failed to update Twilio configuration');
    }
  } catch (error) {
    console.error('Error updating Twilio config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Handle incoming calls webhook
router.post('/voice', async (req: Request, res: Response): Promise<void> => {
  try {
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Check if this is an outgoing call (from client to phone number)
    if (req.body.Direction === 'outbound-api' || req.body.To?.match(/^\+?[0-9]+$/)) {
      console.log('Handling outgoing call to:', req.body.To);
      
      // Get the From number from the Twilio config
      const userId = req.body.From; // This will be the client identity
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        console.error('User not found for outgoing call');
        twiml.say('User not found');
        twiml.hangup();
        res.type('text/xml').send(twiml.toString());
        return;
      }
      
      // Get Twilio config
      const config = await prisma.twilioConfig.findFirst();
      
      if (!config) {
        console.error('Twilio config not found for outgoing call');
        twiml.say('Configuration error');
        twiml.hangup();
        res.type('text/xml').send(twiml.toString());
        return;
      }
      
      // Create call record
      await prisma.callHistory.create({
        data: {
          userId: user.id,
          phoneNumber: req.body.To,
          direction: 'OUTBOUND',
          status: 'INITIATED',
          startTime: new Date()
        } as any // Type assertion to avoid TypeScript errors
      });
      
      // Dial the number
      const dial = twiml.dial({
        callerId: config.phoneNumbers[0] // Use the first configured number as caller ID
      });
      dial.number(req.body.To);
      
      res.type('text/xml').send(twiml.toString());
      return;
    }
    
    // Handle incoming call
    console.log('Handling incoming call from:', req.body.From);
    
    // Get Twilio config
    const config = await prisma.twilioConfig.findFirst();
    
    if (!config) {
      twiml.say('Invalid configuration');
      twiml.hangup();
      res.type('text/xml').send(twiml.toString());
      return;
    }

    // Create call record
    const callRecord = await prisma.callHistory.create({
      data: {
        userId: 'system', // Will be updated when agent answers
        phoneNumber: req.body.From,
        direction: 'INBOUND',
        status: 'RINGING',
        startTime: new Date()
      } as any // Type assertion to avoid TypeScript errors
    });

    // Notify all connected clients about the incoming call
    wss.notifyIncomingCall({
      id: callRecord.id,
      phoneNumber: req.body.From,
      status: 'RINGING',
      direction: 'INBOUND',
      timestamp: new Date().toISOString()
    });

    // Connect to client
    const dial = twiml.dial();
    dial.client('support_agent');

    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('Error handling call:', error);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('An error occurred');
    twiml.hangup();
    res.type('text/xml').send(twiml.toString());
  }
});

// Handle Twilio webhook
router.post('/webhook', express.raw({ type: 'application/x-www-form-urlencoded' }), async (req: Request, res: Response) => {
  try {
    console.log('Webhook received:', {
      body: req.body,
      headers: req.headers
    });

    // Validate the request is coming from Twilio
    const twilioSignature = req.headers['x-twilio-signature'] as string;
    const url = process.env.TWILIO_WEBHOOK_URL || 'https://macaque-fair-mako.ngrok-free.app/api/twilio/webhook'; // Your full ngrok URL
    
    // Skip validation in development for easier testing
    let isValid = true;
    if (process.env.NODE_ENV === 'production') {
      isValid = validateRequest(
        process.env.TWILIO_AUTH_TOKEN!,
        twilioSignature,
        url,
        req.body
      );
    }

    if (!isValid) {
      console.error('Invalid Twilio signature');
      return res.status(401).send('Invalid signature');
    }

    // Process the webhook data
    const eventType = req.body.EventType;
    const callSid = req.body.CallSid;
    const from = req.body.From;
    const to = req.body.To;

    console.log(`Processing Twilio webhook: ${eventType} from ${from} to ${to}`);

    // For call events, forward to the voice endpoint
    if (eventType === 'call.initiated' || eventType === 'call.ringing' || 
        eventType === 'call.answered' || eventType === 'call.completed') {
      
      // Forward to voice endpoint
      const voiceResponse = await fetch(`${req.protocol}://${req.get('host')}/api/twilio/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(req.body)
      });
      
      const responseText = await voiceResponse.text();
      res.type('text/xml').send(responseText);
      return;
    }

    // Find the configuration
    const config = await prisma.twilioConfig.findFirst({
      where: {
        phoneNumbers: { has: to },
        enabled: true
      }
    });

    if (!config) {
      console.error(`No configuration found for phone number: ${to}`);
      return res.status(200).send('No configuration found');
    }

    // Notify connected clients about the incoming call
    if (eventType === 'call.incoming') {
      wss.notifyIncomingCall({
        callSid,
        from,
        to,
        timestamp: new Date().toISOString()
      });
    }

    // Send a TwiML response if needed
    const twiml = new twilio.twiml.VoiceResponse();
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

export default router; 