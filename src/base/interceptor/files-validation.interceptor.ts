import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import multer from 'multer';
import { extname } from 'path';
import { RequestContextService } from '../middlewares/request-context/request-context.service';

export interface FilesValidationOptions {
  fieldName: string;
  maxCount?: number;
  allowedMimeTypes?: string[];
  maxFileSize?: number; // in bytes
  generateUniqueName?: boolean;
}

@Injectable()
export class FilesValidationInterceptor implements NestInterceptor {
  private upload: any;

  constructor(private readonly options: FilesValidationOptions) {
    const {
      fieldName,
      maxCount = 10,
      allowedMimeTypes = [],
      maxFileSize = 5 * 1024 * 1024, // 5MB default
      generateUniqueName = true,
    } = options;

    this.upload = multer({
      storage: multer.memoryStorage(), // Store in memory, not disk
      limits: {
        fileSize: maxFileSize,
      },
      fileFilter: (req, file, callback) => {
        // Validate mime type
        if (allowedMimeTypes.length > 0) {
          if (!allowedMimeTypes.includes(file.mimetype)) {            
            throw  new BadRequestException(
                `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
            );
          }
        }

        // Generate unique filename if needed
        if (generateUniqueName) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          file.filename = `${fieldName}-${uniqueSuffix}${ext}`;
        } else {
          file.filename = file.originalname;
        }

        callback(null, true);
      },
    }).array(fieldName, maxCount);
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
        if (err.code === 'LIMIT_FILE_SIZE') {
          observer.error(
            new BadRequestException(
              `File size exceeds limit of ${this.options.maxFileSize} bytes`,
            ),
          );
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          observer.error(
            new BadRequestException(
              `Too many files. Maximum is ${this.options.maxCount}`,
            ),
          );
        } else {          
          observer.error(new BadRequestException(err.message));
        }
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

    next.handle().subscribe({
      next: (data) => observer.next(data),
      error: (error) => observer.error(error),
      complete: () => observer.complete(),
    });
  }
}