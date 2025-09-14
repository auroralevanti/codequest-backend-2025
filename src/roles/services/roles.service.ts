import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../roles/entities/user-role.entity';
import { Role } from '../../roles/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId, deletedAt: null },
      relations: ['role'],
    });

    return userRoles.map(userRole => userRole.role.name);
  }

  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.includes(roleName);
  }

  async userHasAnyRole(userId: string, roleNames: string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return roleNames.some(role => userRoles.includes(role));
  }

  async addRoleToUser(userId: string, roleName: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    const existingUserRole = await this.userRoleRepository.findOne({
      where: { userId, roleId: role.id },
    });

    if (!existingUserRole) {
      const userRole = this.userRoleRepository.create({
        userId,
        roleId: role.id,
      });
      await this.userRoleRepository.save(userRole);
    }
  }

  async removeRoleFromUser(userId: string, roleName: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    await this.userRoleRepository.softDelete({ userId, roleId: role.id });
  }
}