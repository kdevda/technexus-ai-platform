import express, { Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthRequest, RouteHandler } from '../types';

const router = express.Router();

const getLoanHandler: RouteHandler = (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Loans endpoint' });
};

router.get('/', authMiddleware as any, getLoanHandler);

export default router; 