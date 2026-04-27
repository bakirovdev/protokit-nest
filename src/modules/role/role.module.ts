import { Module } from '@nestjs/common';
import { RoleSearch } from './role.search';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleHelper } from '@src/base/helpers';

@Module({
  controllers: [
    RoleController,
  ],
  providers: [
    RoleService,
    RoleSearch,
    RoleHelper,
  ],
})
export class RoleModule {}
