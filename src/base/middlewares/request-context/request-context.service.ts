import { Injectable } from '@nestjs/common';
import { FullUserType } from '@src/base/http/services';
import { handleError } from '@src/helpers';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response } from 'express';

export interface RequestContext {
  request: Request;
  response: Response;
  user?: FullUserType; // Add user to context,  
}

@Injectable()
export class RequestContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  static getContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  static getRequest(): Request | undefined {
    return this.getContext()?.request;
  }

  // Enhanced run method to preserve existing context
  static run(context: RequestContext, callback: () => void): void {
    // Preserve user from existing context if available
    const existingContext = this.getContext();
    if (existingContext?.user && !context.user) {
      context.user = existingContext.user;
    }

    this.asyncLocalStorage.run(context, callback);
  }  

  static setAuth(user: FullUserType): void {
    const context = this.getContext();

    if (context) {
      context.user = user;
      // Also set on request object for compatibility
      if (context.request) {
        (context.request as any).user = user;
      }
    }
  }

  static getAuth(): FullUserType {
    const context = this.getContext();

    if (context?.user) {
      return context.user;
    }

    // Fallback to request.user
    const request = context?.request;
    const user = (request as any)?.user;

    if (!user) {
     throw handleError('Forbidden', 401)
    }
    
    this.setAuth(user);
    return user;

  }

  static getExcludeId():number | undefined {
    const context = this.getContext();

    if (context?.request?.params) {
      return +context?.request?.params?.id || undefined;
    }
    return undefined;
  }
}