import { Injectable } from "@nestjs/common";

@Injectable()
export class AppendExcludeIdMiddleware {
  use(req: any, res: any, next: () => void) {
    req.body = req.body || {};

    // Try to get ID from named params first
    const params = req.params || {};

    // 1️⃣ Check for real named param :id
    if (params.id) {
      req.body._excludeId = String(params.id);
      return next();
    }

    if (Array.isArray(params.path)) {
      const last = params.path[params.path.length - 1];
      if (last) {
        req.body._excludeId = String(last);
        return next();
      }
    }

    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value) {
        req.body._excludeId = String(value);
        return next();
      }
    }

    next();
  }
}
