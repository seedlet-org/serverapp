import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDTO, RegistrationDTO } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Throttle({ default: { limit: 3, ttl: 5000 } })
  @Post('login')
  async login(@Body() input: LoginDTO) {
    const user = await this.authService.validateUser(input);
    if (!user) {
      throw new BadRequestException(
        'Invalid email or password. Please try again.',
      );
    }
    return this.authService.login(user);
  }

  @Post('register')
  register(@Body() input: RegistrationDTO) {
    return this.authService.register(input);
  }
}
