import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'userid',
      passwordField: 'password',
    });
  }

  async validate(userid: string, password: string) {
    const user = await this.authService.validateUser({ userid, password });
    if (!user) {
      throw new BadRequestException(
        `Invalid email or password. Please try again.`,
      );
    }
    return user;
  }
}
