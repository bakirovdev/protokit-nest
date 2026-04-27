import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Prisma } from '@generated/prisma';
import { BaseService } from '@src/base/http/services/base.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostSearch } from './post.search';
import { PostResource } from './resources/post.resource';

@Injectable({ scope: Scope.REQUEST })
export class PostService extends BaseService {
  protected resource = PostResource;

  constructor(
    @Inject(REQUEST) request: Request,
    search: PostSearch,
  ) {
    super(Prisma.ModelName.Post, request, CreatePostDto, search);
  }
}
