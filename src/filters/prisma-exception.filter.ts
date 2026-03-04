import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    // Map Prisma error codes to HTTP responses
    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = exception.meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
          error: 'Conflict',
        });
        break;
      }

      case 'P2025': {
        // Record not found
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
        });
        break;
      }

      case 'P2003': {
        // Foreign key constraint violation
        const field = exception.meta?.field_name as string | undefined;
        
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: field 
            ? `Invalid ${field} provided` 
            : 'Invalid reference provided',
          error: 'Bad Request',
        });
        break;
      }

      case 'P2014': {
        // Required relation violation
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Required relation is missing',
          error: 'Bad Request',
        });
        break;
      }

      default: {
        // Generic database error
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          error: 'Internal Server Error',
        });
        break;
      }
    }
  }
}