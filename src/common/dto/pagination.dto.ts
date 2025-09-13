import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationDto {

	@ApiPropertyOptional({
		description: 'Number of items to return',
		example: 10,
		minimum: 1,
		default: 10
	})
	@IsOptional()
	@IsPositive()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
  limit: number = 10;

	@ApiPropertyOptional({
		description: 'Number of items to skip',
		example: 0,
		minimum: 0,
		default: 0
	})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
  offset: number = 0;
	
}