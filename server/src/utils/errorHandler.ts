import { Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Handles API errors consistently across the application
 * @param res Express response object
 * @param error The error that occurred
 * @param defaultMessage Default message to show if error details cannot be determined
 */
export const handleApiError = (
  res: Response, 
  error: any, 
  defaultMessage = 'An unexpected error occurred'
): void => {
  console.error('API Error:', error);

  // Handle Prisma-specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        res.status(409).json({
          message: 'A record with this information already exists',
          details: error.meta?.target ? `Duplicate value for: ${error.meta.target}` : undefined
        });
        return;
      
      case 'P2003':
        // Foreign key constraint violation
        if (error.meta?.field_name && typeof error.meta.field_name === 'string' && error.meta.field_name.includes('organization_id')) {
          res.status(400).json({
            message: 'The organization ID does not exist. Please check that you are using a valid organization ID.'
          });
        } else {
          res.status(400).json({
            message: 'Referenced record does not exist',
            details: error.meta?.field_name && typeof error.meta.field_name === 'string' ? `Foreign key violation on: ${error.meta.field_name}` : undefined
          });
        }
        return;
      
      case 'P2025':
        // Record not found
        res.status(404).json({
          message: 'The requested record was not found'
        });
        return;
      
      default:
        // Other Prisma errors
        res.status(400).json({
          message: 'Database constraint violation',
          details: error.message
        });
        return;
    }
  }

  // Handle other types of errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation error',
      details: error.message
    });
    return;
  }

  if (error.name === 'UnauthorizedError' || error.message?.includes('unauthorized')) {
    res.status(401).json({
      message: 'Authentication required. Please log in again.'
    });
    return;
  }

  if (error.name === 'ForbiddenError' || error.message?.includes('forbidden')) {
    res.status(403).json({
      message: 'You do not have permission to perform this action'
    });
    return;
  }

  // Default error response
  res.status(500).json({
    message: defaultMessage,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}; 