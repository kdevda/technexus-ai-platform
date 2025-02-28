import { User, Integration, TwilioConfig, ResendConfig, CallHistory } from '@prisma/client'
import { Request, Response, NextFunction } from 'express';

export type { User, Integration, TwilioConfig, ResendConfig, CallHistory };

export interface UserWithRelations extends User {
  callHistory?: CallHistory[]
}

export interface TableDefinitionInput {
  name: string
  displayName: string
  description?: string
  fields: FieldDefinitionInput[]
}

export interface FieldDefinitionInput {
  name: string
  displayName: string
  type: string
  required?: boolean
  unique?: boolean
  description?: string
  defaultValue?: string
  validation?: string
  lookupConfig?: any
  currencyConfig?: any
  options?: any
  formula?: string
  timezone?: string
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export type AuthRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next?: NextFunction
) => Promise<void> | void;

export type RouteHandler = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void> | void; 