import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '@src/base/http/controllers';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController extends BaseController(CreateUserDto) {
  constructor(readonly service: UserService) {
    super(service);
  }
}
