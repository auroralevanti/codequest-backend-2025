import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Administrator role' })
  @IsString()
  description?: string;
}
