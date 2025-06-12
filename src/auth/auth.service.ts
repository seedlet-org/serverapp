import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/helpers.utils';
import { LoginDTO, RegistrationDTO } from './dto/auth.dto';
import prisma from 'src/prisma/prisma.middleware';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(input: LoginDTO) {
    const user = await this.usersService.user(input.userid);
    if (user && comparePassword(input.password, user.password)) {
      return user;
    }
    return null;
  }

  login(user: User) {
    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        profileUpdated: user.profileUpdated,
      },
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
      id: user.id,
    };
  }
}
