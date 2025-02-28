import { Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { AuthenticatedRequest } from '../types';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors || error.message,
      });
    }
  };
}; 