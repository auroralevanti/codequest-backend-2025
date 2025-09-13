import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ValidRoles } from "../enums/valid-roles.enum";

export class SignupDto {
    
	@ApiProperty({
		description: 'Username for the user account',
		example: 'johndoe123',
		minLength: 3,
		maxLength: 255
	})
	@IsString()
	@MinLength(3)
	@MaxLength(255)
	username: string;

	@ApiProperty({
		description: 'Email address of the user',
		example: 'john.doe@example.com',
		format: 'email'
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'Password for the user account',
		example: 'mySecurePassword123',
		minLength: 6,
		maxLength: 30
	})
	@IsString()
	@MinLength(6)
	@MaxLength(30)
	password: string;

	@ApiPropertyOptional({
		description: 'Avatar URL for the user profile',
		example: 'https://example.com/avatar.jpg',
		maxLength: 100
	})
	@IsString()
	@IsOptional()
	@MaxLength(100)
	avatarUrl?: string;

	@ApiPropertyOptional({
		description: 'Role assigned to the user',
		enum: ValidRoles,
		example: ValidRoles.user,
		default: ValidRoles.user
	})
	@IsEnum(ValidRoles)
	@IsOptional()
	roles?: ValidRoles;

}
