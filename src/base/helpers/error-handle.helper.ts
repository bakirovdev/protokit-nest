import { HttpException, HttpStatus, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createValidationException } from '@src/base/exceptions/i18-validation-exception.factor';
import { AxiosError } from 'axios';
import { ValidationError } from 'class-validator';

const prismaHandle = (error: any): { message: string, error?: any, status: number } | undefined => {  
  // Prisma Client Known Request Error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[];
        const field = target ? target.join(', ') : 'field';
        return {
          message: `A record with this ${field} already exists`,
          error: error,
          status: 409
        }

      case 'P2003':
        return {
          message: 'Foreign key constraint failed. Related record does not exist',
          error: error,
          status: 400
        }

      case 'P2025':
        return {
          message: 'Record not found',
          error: error,
          status: 404
        }

      case 'P2014':
        return {
          message: 'Required relation is missing',
          error: error,
          status: 400
        }

      case 'P2023':
        return {
          message: 'Inconsistent column data',
          error: error,
          status: 400
        }

      default:
        return {
          message: `Database error: ${error.code}`,
          error: error,
          status: 500
        }
    }
  }

  // Prisma Client Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      message: 'Invalid data provided',
      error: error,
      status: 400
    }
  }

  // Prisma Client Initialization Error
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      message: 'Database connection failed',
      error: error,
      status: 500
    }
  }

  // Explicitly return undefined if no conditions are met
  return undefined;
}

export function handleError(error: any, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR): never {
  console.log(error);
  const prismaError = prismaHandle(error);
  if (prismaError) {
    throw new HttpException(
      {
        message: prismaError.message,
        errors: prismaError.error,
      },
      prismaError.status,
    );
  }

  // if it is already http exception just rethrow it
  if (error instanceof HttpException) throw error;

  // if it is validation error
  if (Array.isArray(error) && error.every(e => e instanceof ValidationError)) throw createValidationException(error);

  // If it's an AxiosError, handle it
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as { message?: string } | undefined;

    throw new HttpException(
      {
        message: responseData?.message || axiosError.message || 'Request failed',
        errors: axiosError.response?.data || null,
      },
      axiosError.response?.status || status,
    );
  }

  if (typeof error === 'string') {
    throw new HttpException(
      {
        message: error,
        errors: null,
      },
      status,
    );
  }

  // Handle other types of errors
  throw new HttpException(
    {
      message: error.message || 'An unexpected error occurred',
      errors: null,
    },
    status,
  );
}