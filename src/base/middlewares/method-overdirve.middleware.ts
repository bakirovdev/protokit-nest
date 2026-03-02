import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MethodOverrideMiddleware implements NestMiddleware 
{
  use(req: Request, res: Response, next: NextFunction) {    
    if (req.query._method) {
      const method = (req.query._method as string).toUpperCase();
          
      if (['PUT', 'PATCH'].includes(method)) {
        req.method = method;
      }
      
      delete req.query._method;
    }
        
    next();
  }
}