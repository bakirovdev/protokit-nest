import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "@src/base/http/dto";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, } from "class-validator";
import { IsUnique } from "@src/base/validators/is-unique.validator";
import { Prisma } from "@generated/prisma";

export class CreateRoleDto extends BaseDto 
{
    @ApiProperty({
        type: String,
        required: true
    })
    @IsUnique({
        model: Prisma.ModelName.Role,
        exclude: true,
        column: 'name',        
    })
    @IsNotEmpty()
    name: string;    

    @ApiProperty({
        type: String,
        required: true
    })
    @IsNotEmpty()
    description: string;    

    @ApiProperty({
        description: 'permissions array []',
        example: ["user.index", "user.create"],
        type: [String]
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    permissions: string[];

}