import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ description: 'Username for the user account', example: 'janesmith456', minLength: 3, maxLength: 255 })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  username: string;

  @ApiProperty({ description: 'Email address of the user', example: 'jane.smith@example.com', format: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the user account', example: 'securePassword456', minLength: 6, maxLength: 30 })
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password: string;

  @ApiPropertyOptional({ description: 'Avatar URL for the user profile', example: 'https://example.com/avatar.jpg', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Role assigned to the user (string). Use roles table/service for authoritative values', example: 'user', default: 'user' })
  @IsString()
  @IsOptional()
  roles?: string;
}
