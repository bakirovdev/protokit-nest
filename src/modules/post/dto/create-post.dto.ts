import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "@src/base/http/dto";
import { IsNotEmpty } from "class-validator";

export class CreatePostDto extends BaseDto {
    @ApiProperty()
    @IsNotEmpty()
    title: string

    @ApiProperty()
    @IsNotEmpty()
    content: string
}
