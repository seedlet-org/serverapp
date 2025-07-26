import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  Matches,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class LoginDTO {
  @ApiProperty()
  @IsString()
  userid: string;
  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/, {
    message:
      'Password must be at least 8 characters long, include at least 1 lowercase letter, 1 uppercase letter, and 1 number or special character.',
  })
  password: string;
}

export class RegistrationDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/, {
    message:
      'Password must be at least 8 characters long, include at least 1 lowercase letter, 1 uppercase letter, and 1 number or special character.',
  })
  password: string;
  @ApiProperty()
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username can only contain letters and numbers',
  })
  username: string;
  @ApiProperty()
  @IsString()
  firstname: string;
  @ApiProperty()
  @IsString()
  lastname: string;
  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string; // role_id
}

export class SendOtpDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDTO {
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/, {
    message:
      'Password must be at least 8 characters long, include at least 1 lowercase letter, 1 uppercase letter, and 1 number or special character.',
  })
  password: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;
  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}
