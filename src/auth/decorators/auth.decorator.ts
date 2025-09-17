import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Auth(...roles: string[]) {
  if (roles && roles.length > 0) {
    // Require authentication + specific roles
    return applyDecorators(
      UseGuards(JwtAuthGuard, RolesGuard),
      Roles(...roles),
      ApiBearerAuth('access-token'),
    );
  }

  // Just require authentication (any valid user)
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('access-token'),
  );
}