import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@WebSocketGateway()
export class CommentsGateway {
  constructor(private readonly commentsService: CommentsService) {}

  @SubscribeMessage('createComment')
  create(@MessageBody() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @SubscribeMessage('findAllComments')
  findAll() {
    return this.commentsService.findAll();
  }

  @SubscribeMessage('findOneComment')
  findOne(@MessageBody() id: number) {
    return this.commentsService.findOne(id);
  }

  @SubscribeMessage('updateComment')
  update(@MessageBody() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(updateCommentDto.id, updateCommentDto);
  }

  @SubscribeMessage('removeComment')
  remove(@MessageBody() id: number) {
    return this.commentsService.remove(id);
  }
}
