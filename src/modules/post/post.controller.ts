import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '@src/base/http/controllers';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@ApiTags('Posts')
@Controller('posts')
export class PostController extends BaseController(CreatePostDto) {
  constructor(readonly service: PostService) {
    super(service);
  }
}
