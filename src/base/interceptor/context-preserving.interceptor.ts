import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContextService } from '../middlewares/request-context/request-context.service';

@Injectable()
export class ContextPreservingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    
    // Ensure context exists
    let currentContext = RequestContextService.getContext();
    if (!currentContext) {
      currentContext = { request: req, response: res};
      RequestContextService.run(currentContext, () => {
        return next.handle();
      });      
    }    
    
    return next.handle();
  }
}