import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class I18nValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const i18n = I18nContext.current();
      const formattedErrors = errors.map((error) => {
        const constraints: Record<string, string> = {};
        
        if (error.constraints) {
          Object.keys(error.constraints).forEach((key) => {
            const translationKey = `validation.${key}`;
            const args = {
              property: i18n?.t(`fields.${error.property}`) || error.property,
              constraint1: this.getConstraintValue(error, key),
            };

            constraints[key] = i18n?.t(translationKey, { args }) || error.constraints?.[key] || '';
          });
        }

        return {
          property: error.property,
          constraints: constraints,
        };
      });

      throw new BadRequestException(formattedErrors);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];            
    return !types.includes(metatype);
  }

  private getConstraintValue(error: any, constraintKey: string): any {
    if (error.constraints && error.constraints[constraintKey]) {
      const matches = error.constraints[constraintKey].match(/\d+/);
      return matches ? matches[0] : '';
    }
    return '';
  }
}