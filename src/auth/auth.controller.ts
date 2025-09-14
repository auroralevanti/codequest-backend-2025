import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from './decorators/is-public.decorator';
import { Auth } from './decorators/auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Single signup endpoint:
  // - If request contains a valid admin JWT in `Authorization`, an admin can create users (including admins).
  // - Otherwise it acts as public registration and returns `{ user, token }`.
  @Post('signup')
  @IsPublic()
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

}
