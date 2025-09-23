import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiPropertyOptional({ description: 'Updated comment text', example: 'Updated reply' })
  @IsOptional()
  @IsString()
  body?: string;
}
