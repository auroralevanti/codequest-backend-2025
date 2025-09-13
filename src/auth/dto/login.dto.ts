import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for user authentication',
    example: 'mySecurePassword123',
    minLength: 6,
    maxLength: 30
  })
  @IsString()
	@MinLength(6)
	@MaxLength(30)
	password: string;

}