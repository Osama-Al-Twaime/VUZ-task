import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CreateUserValidationPipe } from 'src/pipes/userValidation';
import { CreateUserDto, UserDto, LoginDto } from 'src/dtos';
import { Serialize } from 'src/interceptors';
import { AuthService } from 'src/services/auth';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @UsePipes(new CreateUserValidationPipe())
  async register(@Body() user: CreateUserDto) {
    return await this.authService.create(user);
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body.email, body.password);
  }
}
