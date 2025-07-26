import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
  Delete,
  ForbiddenException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { RoleType, User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/currrent-user.decorator';
import { UpdateUserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth()
@UseGuards(RolesGuard)
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
  @Roles(RoleType.superAdmin)
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

  // @UseGuards(AuthGuard('jwt'))
  // @ApiOperation({
  //   summary: 'Update user by ID',
  //   description: 'Updates the details of a user by their unique ID.',
  // })
  // @Put(':id')
  // async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   const updatedUser = (await this.usersService.update(
  //     id,
  //     updateUserDto,
  //   )) as User;

  //   const { password: _password, ...user } = updatedUser;

  //   return {
  //     statusCode: 200,
  //     message: 'User updated successfully',
  //     data: user,
  //   };
  // }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only PNG files are allowed'), false);
        }
      },
    }),
  )
  @ApiOperation({
    summary: 'Partially update user by ID',
    description: 'Partially updates the details of a user by their unique ID.',
  })
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const updatedUser = (await this.usersService.update(
      id,
      updateUserDto,
      image,
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
  @Roles(RoleType.user)
  async deleteOwnAccount(@Param('id') id: string, @CurrentUser() user: User) {
    if (user.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    const deletedUser = (await this.usersService.softDelete(id)) as User;
    return {
      statusCode: 200,
      message: 'User deleted successfully',
      data: {
        id: deletedUser.id,
      },
    };
  }
}
