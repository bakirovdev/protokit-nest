import { Injectable } from "@nestjs/common";
import { PrismaService } from "@src/prisma/prisma.service";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

export interface IsHierarchyInterface {    
    column: string
    process: ((dto: any, prisma: PrismaService) => boolean | Promise<boolean>);
}

@Injectable()
@ValidatorConstraint({ name: 'IsExistConstraint', async: true })
export class IsHierarchyConstraint implements ValidatorConstraintInterface {
    
    constructor(private prisma: PrismaService) {}

    async validate(value: any, args?: ValidationArguments): Promise<boolean> {
        const { process } = args?.constraints[0] as IsHierarchyInterface;
        if (!value) return true;
        const dtoInstance = args?.object as any;

        try {            
            const extraConditions =  await process(dtoInstance, this.prisma);

            return extraConditions ? true : false;
        } catch (error) {
            console.error('IsHierarchy validation error:', error);
            return false;
        }
    }


    defaultMessage(args: ValidationArguments): string {
        const { column } = args.constraints[0] as IsHierarchyInterface;
        return `${column} doesn't exist in`;
    }
}

export function IsHierarchy(options: IsHierarchyInterface, validationOptions?: ValidationOptions,) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [options],
            validator: IsHierarchyConstraint,
        });
    };
}