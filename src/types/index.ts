import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    organizationId: string;
    // add other user properties you need
  };
}

export type AuthRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void; 