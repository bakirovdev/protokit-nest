import { UseInterceptors } from '@nestjs/common';
import { FilesValidationInterceptor, FilesValidationOptions } from '../interceptor';

export function ValidateFiles(options: FilesValidationOptions) {
  return UseInterceptors(new FilesValidationInterceptor(options));
}