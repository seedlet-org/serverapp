import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { compareValue, generateOTP, hashValue } from 'src/utils/helpers.utils';
import {
  LoginDTO,
  RegistrationDTO,
  ResetPasswordDTO,
  SendOtpDTO,
} from './dto/auth.dto';
import prisma from 'src/prisma/prisma.middleware';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, RedisKeys } from 'src/constants';
import { EmailService } from 'src/email/email.service';
import { IEmail } from 'src/email/interface/email.interface';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private emailService: EmailService,
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
      `${RedisKeys.RefreshToken}:${user_id}`,
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
    const key = `${RedisKeys.RefreshToken}:${user.id}`;
    await this.redis.set(key, hashedRefreshToken, 'EX', expiresIn);

    return {
      tokens,
      user,
    };
  }

  async register(input: RegistrationDTO) {
    const { email, username, password, lastname, firstname, otp } = input;

    // validate otp
    const key = `${RedisKeys.OTP}:${email}`;
    const hashedOTPSavedInDB = await this.redis.get(key);
    if (!hashedOTPSavedInDB) {
      throw new ForbiddenException('Invalid or expired otp');
    }

    // compare hashed otp and otp
    const otpMatch = compareValue(otp, hashedOTPSavedInDB);
    if (!otpMatch) {
      throw new ForbiddenException('Invalid or expired otp');
    }

    // check if user already exist
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

    const payload: IEmail = {
      to: email,
      subject: 'Seedlet account creation',
      message: `Hi ${firstname},<br/><br/>
      Welcome to Seedlet.<br>
      We're thrilled to have you onboard<br/><br/>
      You've just taken the first step toward turning your ideas into real, collaborative project.<br/><br/>
      Here's what you can do next:<br/>
      <ul>
      <li>Post an idea - share what you're dreaming of.</li>
      <li>Gather interest - watch others rally around your spark.</li>
      <li>Grow your Lab - turn your idea into a Lab where development happens</li>
      <li>Show off your Field - complete Labs are proudly featured in our Field.</li>
      </ul>
      <br/>
      We can't wait to see what you'll build.<br/><br/>
      Let's plant something amazing.<br>
      <strong>The Seedlet Team</strong>`,
    };
    await this.emailService.sendMail(payload);

    return {
      statusCode: 200,
      message: 'User registered successfully',
      data: {
        id: user.id,
      },
    };
  }

  async sendOtp(input: SendOtpDTO) {
    const { email } = input;
    const otp = generateOTP();
    const hashedOTP = hashValue(otp);
    const key = `${RedisKeys.OTP}:${email}`;
    const expiresIn = 5 * 60;
    await this.redis.set(key, hashedOTP, 'EX', expiresIn);

    const payload: IEmail = {
      to: email,
      subject: 'Seedlet OTP',
      message: `Hi there,<br/><br/>
      Your One-Time-Password (OTP) is: <strong>${otp}</strong>.<br/><br>
      This OTP is valid for the next <strong>5 minutes</strong><br/><br/>
      If you did not request this, please ignore this email.<br/><br/>
      Thanks,
      <strong>The Seedlet Team</strong>`,
    };
    await this.emailService.sendMail(payload);

    return {
      email,
    };
  }

  async resetPassword(input: ResetPasswordDTO) {
    const { otp, email, password } = input;

    // validate otp
    const key = `${RedisKeys.OTP}:${email}`;
    const hashedOTPSavedInDB = await this.redis.get(key);
    if (!hashedOTPSavedInDB) {
      throw new ForbiddenException('Invalid or expired otp');
    }

    // compare hashed otp and otp
    const otpMatch = compareValue(otp, hashedOTPSavedInDB);
    if (!otpMatch) {
      throw new ForbiddenException('Invalid or expired otp');
    }

    // hash password
    const hashedPassword = hashValue(password);

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Check if new password is same as current
    if (compareValue(password, currentUser.password)) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // update password
    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });

    // remove otp from DB
    await this.redis.del(key);

    return user;
  }
}
