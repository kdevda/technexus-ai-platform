import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { prisma } from './db';
import integrationsRouter from './routes/integrations';
import tablesRouter from './routes/tables';

const app = express();

// Basic middleware
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'error',
      details: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint
app.get('/api/test', (_req, res) => {
  res.json({ message: 'API is working' });
});

// API routes
app.use('/api/integrations', integrationsRouter);
app.use('/api/tables', tablesRouter);

// Add a catch-all route for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/api/health', '/api/tables', '/api/integrations']
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

export default app; 