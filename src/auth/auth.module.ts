import { Module, Global, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DiscordStrategy } from './strategies/discord.strategy';
import { envs } from '../config';
import { AuthService } from './auth.service';
import { RolesService } from '../roles/services/roles.service';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, DiscordStrategy, RolesService ],
  exports: [ JwtStrategy, PassportModule, JwtModule, RolesService, DiscordStrategy ],
  imports: [
    
    TypeOrmModule.forFeature([Role, UserRole]),
    
  PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      useFactory: () => ({
        secret: envs.jwtSecret,
        signOptions: { expiresIn: '1d' },
      }),
    }),
  
    forwardRef(() => UsersModule), 
  ],
})
export class AuthModule {}
