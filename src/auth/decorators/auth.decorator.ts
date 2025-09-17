import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

export function Auth(...roles: string[]) {
  if (roles && roles.length > 0) {
    // Rely on global JwtAuthGuard; apply RolesGuard when specific roles required
    return applyDecorators(
      UseGuards(RolesGuard),
      Roles(...roles),
      ApiBearerAuth('access-token'),
    );
  }

  // No roles specified: rely on global JwtAuthGuard (applied in main.ts)
  return applyDecorators(
    ApiBearerAuth('access-token'),
  );
}