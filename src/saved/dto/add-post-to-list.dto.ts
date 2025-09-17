import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPostToListDto {
  @ApiProperty({ description: 'ID of the post to add' })
  @IsUUID()
  postId: string;

  @ApiProperty({ description: 'Optional list id; if omitted saves to default list' })
  @IsUUID()
  listId?: string;
}
