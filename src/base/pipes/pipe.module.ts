import { Module, Global } from '@nestjs/common';
import { InjectIdPipe } from './inject-id.pipe';

@Global()
@Module({
  imports: [],
  providers: [
    
    InjectIdPipe
  ],
  exports: [
    InjectIdPipe    
  ],
})
export class PipeModule {}