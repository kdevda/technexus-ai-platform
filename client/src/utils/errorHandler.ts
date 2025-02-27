import { AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

/**
 * Extracts a user-friendly error message from an API error
 * @param error The error object from an API call
 * @param defaultMessage Default message to show if error details cannot be determined
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: any, defaultMessage = 'An unexpected error occurred'): string => {
  // Handle case where error is undefined or null
  if (!error) {
    return defaultMessage;
  }

  // Handle case where error is a string
  if (typeof error === 'string') {
    return error;
  }

  // Handle Twilio specific errors
  if (error.code && error.message && error.name) {
    return `${error.name}: ${error.message} (${error.code})`;
  }

  if (error.response) {
    // Server responded with an error status
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    
    if (error.response.data && error.response.data.error) {
      return error.response.data.error;
    }
    
    // Handle common HTTP status codes
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This operation could not be completed due to a conflict.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return `Server error (${error.response.status})`;
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your network connection.';
  } else if (error.message) {
    // Something else happened while setting up the request
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * Handles API errors by displaying a toast notification
 * @param error The error object from an API call
 * @param title The title for the toast notification
 * @param defaultMessage Default message to show if error details cannot be determined
 */
export const handleApiError = (
  error: any, 
  title = 'Error', 
  defaultMessage = 'An unexpected error occurred'
): void => {
  console.error('API Error:', error);
  
  const errorMessage = getErrorMessage(error, defaultMessage);
  
  toast({
    variant: 'destructive',
    title,
    description: errorMessage,
  });
}; 