import express from 'express';
import cors from 'cors';
import tablesRouter from './routes/tables';
import recordsRouter from './routes/records';
import layoutsRouter from './routes/layouts';
import twilioRouter from './routes/twilio';
import resendRouter from './routes/resend';
import integrationsRouter from './routes/integrations';
import { createServer } from 'http';
import { CallWebSocketServer } from './websocket';
import authRoutes from './routes/auth.routes';
import { apiLimiter, authLimiter } from './middleware/rate-limit.middleware';
import morgan from 'morgan';
import { prisma } from './db';
import path from 'path';
import fs from 'fs';

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
      'https://technexus.ca',
      'https://www.technexus.ca'
    ];
    
    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log(`Origin ${origin} allowed by CORS`);
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS`);
      callback(null, true); // Allow all origins in production for now
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

// API routes should come first
app.use('/api/auth', authRoutes);
app.use('/api/twilio', twilioRouter);
app.use('/api/resend', resendRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/records', recordsRouter);
app.use('/api/layouts', layoutsRouter);

// API test routes
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

app.get('/api/health', async (_req, res) => {
  try {
    console.log('Health check endpoint called');
    
    // Basic server check
    if (!server.listening) {
      console.error('Server is not listening');
      res.status(503).json({ 
        status: 'error',
        message: 'Server is not ready',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
      return;
    }

    // Database check
    try {
      await prisma.$queryRaw`SELECT 1`;
      
      res.json({ 
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      res.status(503).json({ 
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    }
  } catch (error) {
    console.error('Error in health check endpoint:', error);
    res.status(503).json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Error handling middleware for API routes
app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  console.error('API Error:', err);
  
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// API 404 handler - only for /api routes
app.use('/api/*', (_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Static file serving - assume files are in the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Simple catchall route for client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Send the React app for all other routes
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// At the beginning of your file, before starting the server
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Then in your server startup code
const startServer = async () => {
  const isDatabaseConnected = await checkDatabaseConnection();
  
  if (!isDatabaseConnected && process.env.NODE_ENV === 'production') {
    console.error('Cannot start server without database connection in production');
    process.exit(1);
  }
  
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
};

startServer(); 