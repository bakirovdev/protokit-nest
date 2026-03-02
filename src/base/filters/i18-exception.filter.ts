// src/common/filters/i18n-exception.filter.ts
import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException 
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Response } from 'express';

@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const i18n = I18nContext.current();
    const exceptionResponse: any = exception.getResponse();
    
    let message = exceptionResponse.message || exception.message;
    let errors = exceptionResponse.errors || null;

    // Translate main message if it's a translation key (contains dot)
    if (typeof message === 'string' && message.includes('.')) {
      message = i18n?.t(message) || message;
    }

    // Handle validation errors - translate each error message
    if (errors && Array.isArray(errors)) {
      errors = errors.map((error) => {
        let translatedMessage = error.message;        
        
        // If message is a translation key (contains dot), translate it
        if (typeof error.message === 'string' && error.message.includes('.')) {
          translatedMessage = i18n?.t(error.message, {
            args: error.args || {},
          }) || error.message;
        }

        return {
          field: error.field,
          message: translatedMessage,
        };
      });
    }

    response.status(status).json({
      success: false,
      message: message,
      errors: errors,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}