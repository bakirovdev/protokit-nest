import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSearch } from './user.search';

@Module({
  controllers: [UserController],
  providers: [UserService, UserSearch],
})
export class UserModule {}
