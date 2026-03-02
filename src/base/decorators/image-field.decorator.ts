const IMAGE_FIELDS_KEY = Symbol('imageFields');

// Decorator options
interface ImageFieldOptions {
  uploadPath?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  required?: boolean;
}

// Image field decorator
export function ImageField(options: ImageFieldOptions = {}) {
  return function (target: any, propertyKey: string) {
    const imageFields = Reflect.getMetadata(IMAGE_FIELDS_KEY, target) || [];
    imageFields.push({
      field: propertyKey,
      options: {
        uploadPath: options.uploadPath || 'uploads/images',
        maxSize: options.maxSize || 5 * 1024 * 1024, // 5MB default
        allowedTypes: options.allowedTypes || ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
        required: options.required || false,
      },
    });
    Reflect.defineMetadata(IMAGE_FIELDS_KEY, imageFields, target);
  };
}
