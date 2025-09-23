import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../../users/entities/user.entity';
import { RolesService } from '../../roles/services/roles.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles metadata is defined or it's an empty array, treat as no role restriction
    if (!requiredRoles || (Array.isArray(requiredRoles) && requiredRoles.length === 0)) {
      return true;
    }

    const { user }: { user: User } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const hasAnyRole = await this.rolesService.userHasAnyRole(user.id, requiredRoles);
    
    if (!hasAnyRole) {
      throw new ForbiddenException(
        `User ${user.email} does not have any of the required roles: [${requiredRoles.join(', ')}]`
      );
    }

    return true;
  }
}