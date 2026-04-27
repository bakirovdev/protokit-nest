import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "@src/base/http/dto";
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto extends BaseDto {
    @ApiProperty()
    @IsNotEmpty()
    full_name: string

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string
}
