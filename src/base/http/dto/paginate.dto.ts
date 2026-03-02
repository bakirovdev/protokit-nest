import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min } from "class-validator";

export class PaginateDto {
    @ApiProperty({
        description: 'page',
        example: 1,
        required: false,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number) 
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'perPage',
        example: 1,
        required: false,
        type: Number,
    })
    @IsOptional()
    @Type(() => Number) 
    @IsNumber()
    @Min(1)
    perPage?: number = 15;
}