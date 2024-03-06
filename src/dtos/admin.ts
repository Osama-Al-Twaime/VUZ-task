import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserStatus {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
