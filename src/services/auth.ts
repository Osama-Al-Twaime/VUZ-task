import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { MailService } from './mail';
import { User } from 'src/models';
import { Model } from 'mongoose';
import { CreateUserDto, UserDto } from 'src/dtos';
import { UserStatus } from 'src/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const { email, password } = createUserDto;
    const hashedPassword = await this.hashPassword(password);
    const checkUser = await this.userModel.findOne({ email });
    if (checkUser) {
      throw new BadRequestException('Email already in use');
    }

    const user = await this.userModel.create({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hashedPassword,
    });

    console.log(user);

    this.mailService.sendMail({
      from: this.configService.get<string>('EMAIL_PROVIDER_USER'),
      to: user.email,
      subject: `Welcome to shipment app ${user.firstName} ${user.lastName}`,
      html: `<p>Hi ${user.firstName} ${user.lastName}, Welcome to shipment app!</p></br><p>Thank you for using our app!</p>`,
    });

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async login(email: string, password: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User Not found');
    }

    const isValidPassword = await this.comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new BadRequestException('Email or password is incorrect');
    }

    if (user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException('Account is not approved Yet');
    }

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateToken(user: Partial<User>): string {
    const payload = { email: user.email, userRole: user.role };
    const secretKey = this.configService.get<string>('JWT_SECRET');
    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
  }

  verifyToken(token: string): any {
    const secretKey = this.configService.get<string>('JWT_SECRET');
    try {
      return jwt.verify(token, secretKey);
    } catch (error) {
      throw new InternalServerErrorException('Token not verified');
    }
  }
}
