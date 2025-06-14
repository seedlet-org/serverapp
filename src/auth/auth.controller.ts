import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDTO, RegistrationDTO } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Throttle({ default: { limit: 3, ttl: 5000 } })
  @Post('login')
  async login(
    @Body() input: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(input);
    if (!user) {
      throw new BadRequestException(
        'Invalid email or password. Please try again.',
      );
    }

    const { tokens } = await this.authService.login(user);

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    });

    return {
      statuscode: 0,
      message: 'Logged in successfully',
      data: {
        access_token: tokens.access_token,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        profileUpdated: user.profileUpdated,
      },
    };
  }

  @Post('register')
  register(@Body() input: RegistrationDTO) {
    return this.authService.register(input);
  }
}
