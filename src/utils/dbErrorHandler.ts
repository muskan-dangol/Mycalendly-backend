import { logger } from '../../src/utils/logger';

export enum ErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Configuration errors
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',

  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  TABLE_NOT_FOUND = 'TABLE_NOT_FOUND',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Generic errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ErrorInfo {
  code: ErrorCode;
  message: string;
  statusCode: number;
}

/**
 * Convert database errors to user-friendly messages
 */
export const handleDatabaseError = (error: unknown): ErrorInfo => {
  // Log the full error for debugging
  logger.error('Database error:', error);

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Table/relation not found errors
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      return {
        code: ErrorCode.TABLE_NOT_FOUND,
        message: 'Database configuration error. Please contact support.',
        statusCode: 500,
      };
    }

    // Connection errors
    if (
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connect econnrefused')
    ) {
      return {
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Unable to connect to the database. Please try again later.',
        statusCode: 503,
      };
    }

    // Unique constraint violations
    if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate key')) {
      if (errorMessage.includes('email')) {
        return {
          code: ErrorCode.USER_ALREADY_EXISTS,
          message: 'User with this email already exists',
          statusCode: 409,
        };
      }
      return {
        code: ErrorCode.DATABASE_ERROR,
        message: 'This record already exists',
        statusCode: 409,
      };
    }

    // Foreign key violations
    if (
      errorMessage.includes('foreign key') ||
      errorMessage.includes('violates foreign key constraint')
    ) {
      return {
        code: ErrorCode.DATABASE_ERROR,
        message: 'Invalid reference. Please check your input.',
        statusCode: 400,
      };
    }

    // Not null violations
    if (errorMessage.includes('not null') || errorMessage.includes('null value in column')) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Required fields are missing',
        statusCode: 400,
      };
    }
  }

  // Generic database error
  return {
    code: ErrorCode.DATABASE_ERROR,
    message: 'A database error occurred. Please try again later.',
    statusCode: 500,
  };
};

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public code: ErrorCode;
  public statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create user-friendly error from various error types
 */
export const createAppError = (error: unknown): AppError => {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }

  // Handle database errors
  if (error instanceof Error) {
    const errorInfo = handleDatabaseError(error);
    return new AppError(errorInfo.code, errorInfo.message, errorInfo.statusCode);
  }

  // Generic error
  return new AppError(
    ErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred. Please try again later.',
    500
  );
};
