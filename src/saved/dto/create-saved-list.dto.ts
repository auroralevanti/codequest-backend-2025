import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSavedListDto {
  @ApiProperty({ description: 'Title of the saved list', example: 'Reading list' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Optional description', example: 'Articles to read later' })
  @IsOptional()
  @IsString()
  description?: string;
}
