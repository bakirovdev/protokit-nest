import { Injectable } from "@nestjs/common";
import { Prisma } from "@generated/prisma";
import { PrismaService } from "@src/prisma/prisma.service";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

export interface IsExistInterface {
    model: Prisma.ModelName;
    column?: string;
    extra_query?: ((dto: any) => Record<string, any> | Promise<Record<string, any>>);
}

@Injectable()
@ValidatorConstraint({ name: 'IsExistConstraint', async: true })
export class IsExistConstraint implements ValidatorConstraintInterface {
    
    constructor(        
        private prisma: PrismaService,    
    ) {}

    async validate(value: any, args?: ValidationArguments): Promise<boolean> {
        const { model, column, extra_query } = args?.constraints[0] as IsExistInterface;
        
        if (!value) return true;

        const dtoInstance = args?.object as any;

        try {
            value = Array.isArray(value) ? value : [value];            
            const where: Record<string, any> = {
                [column || 'id']: {in: value} 
            };            
            if (extra_query) {
                const extraConditions =  await extra_query(dtoInstance);
                Object.assign(where, extraConditions);
            }                        
            
            const record = await this.prisma[model].findMany({ where });

            return record.length >= value.length;
            
        } catch (error) {
            console.error('IsExist validation error:', error);
            return false;
        }
    }


    defaultMessage(args: ValidationArguments): string {
        const { model, column } = args.constraints[0] as IsExistInterface;
        return `${column} doesn't exist in ${model}`;
    }
}

export function IsExist(options: IsExistInterface, validationOptions?: ValidationOptions,) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [options],
            validator: IsExistConstraint,
        });
    };
}