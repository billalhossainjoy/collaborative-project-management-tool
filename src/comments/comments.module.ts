import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsGateway } from './comments.gateway';

@Module({
  providers: [CommentsGateway, CommentsService],
})
export class CommentsModule {}
