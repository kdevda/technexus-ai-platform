import { User, Organization, TwilioConfig, ResendConfig, CallHistory } from '@prisma/client'
import { Request, Response, NextFunction } from 'express';

export interface UserWithRelations extends User {
  callHistory?: CallHistory[]
}

export interface OrganizationWithRelations extends Organization {
  twilioConfig?: TwilioConfig[]
  resendConfig?: ResendConfig
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

export interface AuthRequest extends Request {
  user?: {
    id: string
    organizationId: string
    role: string
  }
}

export type AuthRequestHandler = (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => Promise<void> | void;

export type RouteHandler = (
  req: AuthRequest,
  res: Response
) => Promise<void> | void; 