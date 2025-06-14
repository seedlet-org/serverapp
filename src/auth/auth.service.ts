import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { compareValue, hashValue } from 'src/utils/helpers.utils';
import { LoginDTO, RegistrationDTO } from './dto/auth.dto';
import prisma from 'src/prisma/prisma.middleware';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/constants';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async validateUser(input: LoginDTO) {
    const user = await this.usersService.user(input.userid);
    if (user && compareValue(input.password, user.password)) {
      return user;
    }
    return null;
  }

  async validateRefreshToken(user_id: string, refresh_token: string) {
    const hashedTokenInRedis = await this.redis.get(
      `auth:user:refresh_token:${user_id}`,
    );
    if (!hashedTokenInRedis) {
      return null;
    }

    const isMatch = compareValue(refresh_token, hashedTokenInRedis);

    if (!isMatch) {
      return null;
    }

    return this.usersService.findById(user_id);
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };

    // Generate access and refresh tokens
    const tokens = {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    };

    // hash and save refresh token in redis
    const hashedRefreshToken = hashValue(tokens.refresh_token);
    const expiresIn = 7 * 24 * 60 * 60; // 7days in seconds
    await this.redis.set(
      `auth:user:refresh_token:${user.id}`,
      hashedRefreshToken,
      'EX',
      expiresIn,
    );

    return {
      tokens,
      user,
    };
  }

  async register(input: RegistrationDTO) {
    const { email, username, password, lastname, firstname } = input;

    const isExisting = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (isExisting) {
      throw new ConflictException('user already exists');
    }

    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        username: username.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        password,
      },
    });

    return {
      statuscode: 0,
      message: 'User registered successfully',
      data: {
        id: user.id,
      },
    };
  }
}
