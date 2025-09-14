import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

export function Auth(...roles: string[]) {
  return applyDecorators(
    UseGuards(RolesGuard), 
    Roles(...roles),
    ApiBearerAuth('access-token'),
  );
}