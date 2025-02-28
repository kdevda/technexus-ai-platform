import express, { Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest, RouteHandler } from '../types';

const router = express.Router();

const getLoanHandler: RouteHandler = (_req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'Loans endpoint' });
};

router.get('/', authMiddleware, getLoanHandler);

export default router; 