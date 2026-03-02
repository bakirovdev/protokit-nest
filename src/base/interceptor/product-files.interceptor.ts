import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import multer from 'multer';
import { RequestContextService } from '@src/base/middlewares/request-context/request-context.service';

@Injectable()
export class ProductFilesInterceptor implements NestInterceptor {
  private upload: any;

  constructor() {
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        
        if (!allowedMimeTypes.includes(file.mimetype)) {
          callback(new Error(
            `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
          ));
        } else {
          callback(null, true);
        }
      },
    }).any();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {                
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    // Get current context BEFORE multer
    const currentContext = RequestContextService.getContext();

    return new Observable((observer) => {
      // Wrap multer callback to preserve AsyncLocalStorage context
      const multerCallback = (err: any) => {
        // Restore original context for the rest of the request
        if (currentContext) {
          RequestContextService.run(currentContext, () => {
            this.handleMulterResult(err, req, res, next, observer);
          });
        } else {
          this.handleMulterResult(err, req, res, next, observer);
        }
      };

      // Execute multer with preserved context
      if (currentContext) {
        RequestContextService.run(currentContext, () => {
          this.upload(req, res, multerCallback);
        });
      } else {
        this.upload(req, res, multerCallback);
      }
    });
  }

  private handleMulterResult(
    err: any, 
    req: any, 
    res: any, 
    next: CallHandler, 
    observer: any
  ) {
    if (err) {                    
      if (err instanceof multer.MulterError) {
        observer.error(new BadRequestException(err.message));
      } else {
        observer.error(err);
      }
      return;
    }

    // Ensure user is available in context after multer
    const user = RequestContextService.getAuth();
    if (!user && req.user) {
      RequestContextService.setAuth(req.user);
    }

    const files = req.files as Express.Multer.File[] || [];                
    
    const productImages: Express.Multer.File[] = [];
    const variationImagesMap: { [key: number]: Express.Multer.File[] } = {};

    if (files && Array.isArray(files) && files.length > 0) {
      files.forEach(file => {
        if (file.fieldname === 'product_images') {
          productImages.push(file);
        } else if (file.fieldname.startsWith('variations[')) {
          const match = file.fieldname.match(/variations\[(\d+)\]\[images\]/);
          
          if (match) {
            const index = parseInt(match[1], 10);
            if (!variationImagesMap[index]) {
              variationImagesMap[index] = [];
            }
            variationImagesMap[index].push(file);
          }
        }
      });
    }                
                                                                            
    // Normalize variations to array
    if (req.body.variations) {
      if (!Array.isArray(req.body.variations)) {
        req.body.variations = [req.body.variations];
      }

      // Attach images to each variation by index
      req.body.variations = req.body.variations.map((variation: any, index: number) => {
        return {
          ...variation,
          images: variationImagesMap[index] || []
        };
      });
    
    } else {
      req.body.variations = [];
    }

    // Attach product images to body
    req.body.product_images = productImages;

    // Proceed with the request handler
    next.handle().subscribe({
      next: (data) => observer.next(data),
      error: (error) => observer.error(error),
      complete: () => observer.complete(),
    });
  }
}