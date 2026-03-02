import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/prisma/prisma.service';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { HierarchyService } from '../http/services';
import { RequestContextService } from '../middlewares/request-context/request-context.service';

export interface IsUniqueInterface {
  model: Prisma.ModelName;
  column: string;
  exclude?: boolean;
  extra_query?: ((dto: any, hierarchyService: HierarchyService) => Record<string, any> | Promise<Record<string, any>>);
}

@Injectable()
@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface 
{
  constructor(    
    private hierarchyService: HierarchyService,
    private readonly prismaService: PrismaService,    
  ){}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const { model, column, exclude, extra_query } = args?.constraints[0] as IsUniqueInterface;
    
    if (!value) return true;
    
    const dtoInstance = args?.object as any;
    
    try {
      const where: any = { [column]: value };
      
      // Add extra query conditions
      if (extra_query) {
        const extraConditions = await extra_query(dtoInstance, this.hierarchyService)
        Object.assign(where, extraConditions);
      }      
      
      // Exclude current record for updates
      let excludeId = RequestContextService.getExcludeId();      
      
      if ((!excludeId || excludeId === undefined) && args?.object['_request']) {
        excludeId = args.object['_request']._excludeId;
      }
      
      if (exclude && excludeId) {
        where.id = { not: excludeId };
      }      
                    
      const record = await this.prismaService[model].findFirst({where});            
      
      return !record;

    } catch (error) {
      console.error('IsUnique validation error:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const { model, column } = args.constraints[0] as IsUniqueInterface;
    return `This ${column} already exists in ${model}`;
  }
}

export function IsUnique(
  options: IsUniqueInterface,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    });
  };
}