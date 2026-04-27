import { IsOptional } from "class-validator";

export enum ToPrismaTypeEnum {
    create = 'create',
    update = 'update',
}
export class BaseDto 
{
    @IsOptional()
    _excludeId: string

    toCreate(type: ToPrismaTypeEnum): any 
    {
        const result: any = {};

        for (const key in this) {
            
            if (this.hasOwnProperty(key) && this[key] !== undefined) {
                const value = this[key];

                if (value instanceof BaseDto) {
                    result[key] = {
                        [type]: value.toCreate(type)
                    };
                }
                else if (Array.isArray(value) && value[0] instanceof BaseDto) {
                    let operator = 'createMany';
                    if (type === ToPrismaTypeEnum.update) {
                        operator = 'updateMany';
                    }
                    result[key] = {
                        [operator]: value.map(item => item.toCreate(type))
                    };
                }

                else {
                    result[key] = value;
                }
            }
        }
        result._excludeId = undefined;

        return result;
    }

}