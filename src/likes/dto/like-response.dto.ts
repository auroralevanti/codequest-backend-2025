import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  postId: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;
}
