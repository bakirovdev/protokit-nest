import { Injectable } from "@nestjs/common";

@Injectable()
export class AppendExcludeIdMiddleware {
  use(req: any, res: any, next: () => void) {
    req.body = req.body || {};

    // Try to get ID from named params first
    const params = req.params || {};

    // 1️⃣ Check for real named param :id
    if (params.id && !isNaN(params.id)) {
      req.body._excludeId = Number(params.id);
      return next();
    }

    if (Array.isArray(params.path)) {
      const last = params.path[params.path.length - 1];
      if (!isNaN(last)) {
        req.body._excludeId = Number(last);
        return next();
      }
    }

    for (const key of Object.keys(params)) {
      const value = params[key];
      if (!isNaN(value)) {
        req.body._excludeId = Number(value);
        return next();
      }
    }
    
    next();
  }
}