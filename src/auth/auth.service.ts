import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';

import { SignupDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Admin-only signup: creates users (admin can create admin accounts)
  async signupAdmin(signupDto: SignupDto) {
    const { password, ...userData } = signupDto;
    if (userData.avatarUrl === '') delete (userData as any).avatarUrl;
    const hashed = bcryptjs.hashSync(password, 10);
    const user = await this.usersService.create({
      ...userData,
      password: hashed,
    });
    delete user.password;
    return user;
  }

  // Public register: normal users register and receive JWT
  async register(signupDto: SignupDto) {
    const { password, roles, ...userData } = signupDto;
    if ((userData as any).avatarUrl === '') delete (userData as any).avatarUrl;
    const hashed = bcryptjs.hashSync(password, 10);

    // Force role to 'user' regardless of payload
    const user = await this.usersService.create({
      ...userData,
      password: hashed,
      roles: 'user',
    });

    const token = this.getJwtToken(user.id);

    delete user.password;

    return {
      user,
      token,
    };
  }

  // Unified signup: if an Authorization header with a valid admin JWT is provided,
  // allow creation of admins (respecting `roles` in DTO). Otherwise create a regular user and return JWT.
  async signup(signupDto: SignupDto, authorization?: string) {
    // If Authorization header exists, try to validate token and check admin role
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '');
      try {
        const payload: any = this.jwtService.verify(token);
        const actor = await this.usersService.findOneById(payload.id);
        if (actor && actor.roles === 'admin') {
                  // Admin creating user: allow roles from DTO (default to 'user' if not provided)
          const { password, ...userData } = signupDto;
          if ((userData as any).avatarUrl === '') delete (userData as any).avatarUrl;
          const hashed = bcryptjs.hashSync(password, 10);
          const user = await this.usersService.create({
            ...userData,
            password: hashed,
                    roles: signupDto.roles ?? 'user',
          });
          delete user.password;
          return user;
        }
      } catch (error) {
        // Invalid token; fall through to public registration
      }
    }

    // Public registration (no valid admin token): create regular user and return JWT
    return this.register(signupDto);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmail( email );
    if(!user) {
      throw new UnauthorizedException('Credentials not valid');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if(!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.getJwtToken(user.id)

    delete user.password;
    delete user.createdAt;

    return {
      user,
      token,
    }
  }

  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }

  async validateUser( id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);

    delete user.password;

    return user;
  }

  // Find or create a user from Discord profile and return { user, token }
  async loginOrRegisterDiscord(profile: any) {
    // Profile shape from passport-discord: { id, username, discriminator, avatar, email }
    const discordId = profile.id;
    const email = profile.email;
    const username = profile.username || `discord_${discordId}`;
    const avatarUrl = profile.avatar ? `https://cdn.discordapp.com/avatars/${discordId}/${profile.avatar}.png` : undefined;

    // Try to find existing user by discordId first, then by email
    let user = null;
    try {
      if (discordId) {
        user = await this.usersService.findOneByDiscordId(discordId);
      }
    } catch (err) {
      // ignore
    }

    if (!user && email) {
      try {
        user = await this.usersService.findOneByEmail(email);
      } catch (err) {
        // ignore
      }
    }

    if (!user) {
      // Create user with a random password (not used) and discordId linked
      const randomPass = Math.random().toString(36).slice(-12) + 'A1!';
      const createDto: any = {
        username,
        email: email || `${discordId}@discord.local`,
        password: randomPass,
        avatarUrl,
        roles: 'user',
        discordId,
      };

      user = await this.usersService.create(createDto);
    } else {
      // Ensure discordId is set if user found by email
      if (!user.discordId && discordId) {
        try {
          await this.usersService.linkDiscordId(user.id, discordId);
          user = await this.usersService.findOneById(user.id);
        } catch (err) {
          // ignore
        }
      }
    }

    const token = this.getJwtToken(user.id);
    delete (user as any).password;
    return { user, token };
  }
}
