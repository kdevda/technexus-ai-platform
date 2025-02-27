import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

// Twilio needs to verify that requests are coming from Twilio
const validateRequest = (req: NextApiRequest) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const url = process.env.WEBHOOK_URL; // Your full ngrok URL

  if (!authToken || !url) {
    throw new Error('Missing Twilio auth token or webhook URL');
  }

  return twilio.validateRequest(
    authToken,
    twilioSignature as string,
    url,
    req.body
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate the request is from Twilio
    const isValidRequest = validateRequest(req);
    if (!isValidRequest) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Handle the incoming message
    const { Body, From } = req.body;

    // Create a TwiML response
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(`Received your message: ${Body}`);

    // Send the response back to Twilio
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Disable body parsing, Twilio needs the raw body for signature validation
export const config = {
  api: {
    bodyParser: false,
  },
}; 