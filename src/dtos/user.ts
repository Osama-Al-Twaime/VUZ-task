import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { Role } from 'src/enums';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}

class User {
  @Expose()
  email: string;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  role: Role;
}

export class UserDto {
  @Expose()
  @Type(() => UserDto)
  user: User;

  @Expose()
  token: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
