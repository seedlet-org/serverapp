import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = (await this.usersService.findById(id)) as User;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = user;
    return {
      statusCode: 200,
      message: 'User retrieved successfully',
      data,
    };
  }
}
