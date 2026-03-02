import { UseInterceptors } from '@nestjs/common';
import { FileValidationInterceptor, FileValidationOptions } from '../interceptor';

export function ValidateFile(options: FileValidationOptions) {
  return UseInterceptors(new FileValidationInterceptor(options));
}