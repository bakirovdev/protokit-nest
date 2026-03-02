// src/common/exceptions/validation-exception.factory.ts
import { HttpException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function createValidationException(errors: ValidationError[]) {
  const formattedErrors: any[] = [];    

  const extractErrors = (error: ValidationError, parentPath = '') => {
    const fieldPath = parentPath 
      ? `${parentPath}.${error.property}` 
      : error.property;

    if (error.constraints) {
      Object.keys(error.constraints).forEach((constraintKey) => {
        // Get constraint parameters (like min, max values)
        const constraintValue = error.constraints?.[constraintKey];
        const contexts = error.contexts?.[constraintKey] || {};
        
        formattedErrors.push({
          field: fieldPath,
          message: `validation.${constraintKey}`, // Translation key
          args: {
            property: fieldPath,
            value: error.value,
            ...contexts,
          },
        });
      });
    }

    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      error.children.forEach((childError) => {
        extractErrors(childError, fieldPath);
      });
    }
  };

  errors.forEach((error) => extractErrors(error));

  // Throw BadRequestException with formatted errors
  throw new HttpException({
    message: 'validation.failed',
    errors: formattedErrors,
  }, 422);
}