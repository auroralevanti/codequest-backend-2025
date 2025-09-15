import { IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  postId: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
