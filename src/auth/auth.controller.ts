import { Body, Controller, Post, Headers, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiHeader } from '@nestjs/swagger';
import { IsPublic } from './decorators/is-public.decorator';
import { Auth } from './decorators/auth.decorator';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { envs } from '../config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Single signup endpoint:
  // - If request contains a valid admin JWT in `Authorization`, an admin can create users (including admins).
  // - Otherwise it acts as public registration and returns `{ user, token }`.
  @Post('signup')
  @IsPublic()
  @ApiHeader({ name: 'authorization', description: 'Optional admin Bearer token', required: false })
  async signup(
    @Body() signupDto: SignupDto,
    @Headers('authorization') authorization?: string,
  ) {
    return await this.authService.signup(signupDto, authorization);
  }

  @Post('login')
  @IsPublic()
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  // Redirects the user to Discord for authentication
  @Get('discord')
  @IsPublic()
  @UseGuards(AuthGuard('discord'))
  discordAuth() {
    // Guard redirects to Discord - this handler will not be called.
  }

  // Discord callback endpoint
  @Get('discord/callback')
  @IsPublic()
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req: Request, @Res() res: Response) {
    // Passport attaches the user info to req.user
    const payload: any = req.user as any;
    if (!payload || !payload.profile) {
      return res.status(400).json({ message: 'Invalid Discord response' });
    }

    const profile = payload.profile;
    // Let AuthService handle user lookup/creation and JWT issuance
    const result = await this.authService.loginOrRegisterDiscord(profile);

    // If frontend URL configured, redirect with token in query. Otherwise return JSON.
    const frontend = envs.frontendUrl;
    if (frontend) {
      const redirectTo = `${frontend.replace(/\/$/, '')}/auth/discord/success?token=${result.token}`;
      return res.redirect(302, redirectTo);
    }

    return res.json(result);
  }

}
