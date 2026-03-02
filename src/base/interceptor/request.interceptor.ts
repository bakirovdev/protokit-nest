import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.params?.id) {
      const excludeId = parseInt(request.params.id, 10);

      if (!request.body) {
        request.body = {}
      }
      request.body._excludeId = excludeId;
    }

    return next.handle();
  }
}