import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Institutional email or username is required.' })
  @IsString()
  identifier: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  password: string;
}

export class RegisterInviteDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  role: 'STUDENT' | 'GUIDE';

  @IsNotEmpty()
  @IsString()
  invitationCode: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
