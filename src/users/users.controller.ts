import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Patch,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/currrent-user.decorator';
import { UpdateUserDto } from './dto/user.dto';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns details of the currently authenticated user.',
  })
  @Get('/me')
  async me(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _password, ...userFromDb } =
      (await this.usersService.findById(user.id)) as User;

    return {
      statusCode: 200,
      message: 'User retrieved successfully',
      data: userFromDb,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns a list of all registered users.',
  })
  @Get()
  async users() {
    const users = await this.usersService.users();

    return {
      statusCode: 200,
      message: 'All users retrieved successfully',
      data: users,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Returns details of a user by their unique ID.',
  })
  @Get(':id')
  async userByID(@Param('id') id: string) {
    const user = (await this.usersService.findById(id)) as User;
    const { password: _password, ...data } = user;
    return {
      statusCode: 200,
      message: 'User retrieved successfully',
      data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get user by email or username',
    description:
      'Returns details of a user by their email address or username.',
  })
  @Get(':emailOrUsername')
  async userByEmailOrUsername(
    @Param('emailOrUsername') emailOrUsername: string,
  ) {
    const user = await this.usersService.user(emailOrUsername);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _password, ...data } = user;
    return {
      statusCode: 200,
      message: 'User retrieved successfully',
      data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Updates the details of a user by their unique ID.',
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = (await this.usersService.update(
      id,
      updateUserDto,
    )) as User;

    const { password: _password, ...user } = updatedUser;

    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Partially update user by ID',
    description: 'Partially updates the details of a user by their unique ID.',
  })
  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<UpdateUserDto>,
  ) {
    const updatedUser = (await this.usersService.update(
      id,
      updateUserDto,
    )) as User;

    const { password: _password, ...user } = updatedUser;

    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Delete user by ID',
    description: 'Soft-deletes a user by their unique ID.',
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const user = (await this.usersService.softDelete(id)) as User;
    return {
      statusCode: 200,
      message: 'User deleted successfully',
      data: {
        id: user.id,
      },
    };
  }
}
