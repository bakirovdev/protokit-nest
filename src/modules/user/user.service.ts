import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Prisma } from '@generated/prisma';
import { BaseService } from '@src/base/http/services/base.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserSearch } from './user.search';
import { UserResource } from './resources/user.resource';

@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseService {
  protected resource = UserResource;

  constructor(
    @Inject(REQUEST) request: Request,
    search: UserSearch,
  ) {
    super(Prisma.ModelName.User, request, CreateUserDto, search);
  }
}
