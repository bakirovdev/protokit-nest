import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostSearch } from './post.search';

@Module({
  controllers: [PostController],
  providers: [PostService, PostSearch],
})
export class PostModule {}
