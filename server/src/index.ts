import express from 'express';
import cors from 'cors';
import tablesRouter from './routes/tables';
import recordsRouter from './routes/records';
import layoutsRouter from './routes/layouts';
import twilioRouter from './routes/twilio';
import resendRouter from './routes/resend';
import organizationRouter from './routes/organization.routes';
import integrationsRouter from './routes/integrations';
import { createServer } from 'http';
import { CallWebSocketServer } from './websocket';
import authRoutes from './routes/auth.routes';
import { apiLimiter, authLimiter } from './middleware/rate-limit.middleware';
import morgan from 'morgan';

const app = express();
const server = createServer(app);
export const wss = new CallWebSocketServer(server);

const PORT = process.env.PORT || 3001;

// Trust proxy - needed for rate limiting when behind a proxy
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      console.log('Request with no origin allowed');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001',
      'https://macaque-fair-mako.ngrok-free.app'
    ];
    
    // Check if the origin is allowed or matches the ngrok pattern
    if (allowedOrigins.indexOf(origin) !== -1 || origin.match(/\.ngrok-free\.app$/)) {
      console.log(`Origin ${origin} allowed by CORS`);
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS, but allowing for debugging`);
      callback(null, true); // Allow all origins for now to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Routes - specific routes first
app.use('/api/auth', authRoutes);
app.use('/api/twilio', twilioRouter);
app.use('/api/resend', resendRouter);
app.use('/api/integrations', integrationsRouter);
// Remove organization routes since we've removed the organization concept
// app.use('/api/organizations', organizationRouter);

// General routes last
app.use('/api/tables', tablesRouter);
app.use('/api/records', recordsRouter);
app.use('/api/layouts', layoutsRouter);

// Test route
app.get('/api/test', (_req, res) => {
  try {
    console.log('Test endpoint called');
    res.json({ 
      message: 'Server is running correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  try {
    console.log('Health check endpoint called');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Error in health check endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log(`- Health check: http://localhost:${PORT}/api/health`);
  console.log(`- Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`- Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`- Integrations API: http://localhost:${PORT}/api/integrations`);
  console.log(`- Tables API: http://localhost:${PORT}/api/tables`);
  console.log(`- Layouts API: http://localhost:${PORT}/api/layouts`);
}); 