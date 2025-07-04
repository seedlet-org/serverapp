import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  LoginDTO,
  RegistrationDTO,
  ResetPasswordDTO,
  SendOtpDTO,
} from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/currrent-user.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async handleTokenAsCookie(user: User, response: Response) {
    const { tokens } = await this.authService.login(user);

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'strict'
          : 'lax',
      path: '/',
      domain:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'seedlet-api.onrender.com'
          : 'localhost',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    });

    return {
      access_token: tokens.access_token,
      email: user.email,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      profileUpdated: user.profileUpdated,
    };
  }

  @UseGuards(AuthGuard('local'))
  @Throttle({ default: { limit: 3, ttl: 5000 } })
  @ApiOperation({
    summary: 'User login',
    description: 'Logs in a user and returns access tokens.',
  })
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

    const result = await this.handleTokenAsCookie(user, response);

    return {
      statusCode: 200,
      message: 'Logged in successfully',
      data: {
        ...result,
      },
    };
  }

  @ApiOperation({
    summary: 'User registration',
    description:
      'Registers a new user and returns access tokens and user information.',
  })
  @Post('register')
  register(@Body() input: RegistrationDTO) {
    return this.authService.register(input);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refreshes the access token using a valid refresh token.',
  })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as User;
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const result = await this.handleTokenAsCookie(user, res);

    return {
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: {
        ...result,
      },
    };
  }

  @Throttle({ default: { limit: 1, ttl: 300000 } })
  @ApiOperation({
    summary: 'Send OTP to email',
    description: "Sends an OTP to the user's email",
  })
  @Post('otp')
  async sendOtp(@Body() input: SendOtpDTO) {
    const response = (await this.authService.sendOtp(input)) as {
      email: string;
    };

    return {
      statusCode: 200,
      message: 'OTP will arrive shortly',
      data: {
        email: response.email,
      },
    };
  }

  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets the user password using a valid OTP.',
  })
  @Post('reset-password')
  async resetPassword(@Body() input: ResetPasswordDTO) {
    const response = (await this.authService.resetPassword(input)) as User;

    const { password: _password, ...user } = response;

    return {
      statusCode: 200,
      message: 'Password reset successfully',
      data: {
        ...user,
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Logout',
    description: 'Logout from current session',
  })
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    const result = await this.authService.logout(user.id);
    if (!result) {
      throw new BadRequestException('Something went wrong');
    }
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'strict'
          : 'lax',
      path: '/',
      domain:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'seedlet-api.onrender.com'
          : 'localhost',
    });

    return {
      statusCode: 200,
      message: 'Logged out successfully',
    };
  }
}
