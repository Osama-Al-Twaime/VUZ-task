import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from 'src/dtos';

@Injectable()
export class CreateUserValidationPipe implements PipeTransform<any> {
  async transform(value: any) {
    const userDto = plainToClass(CreateUserDto, value);

    const errors = await validate(userDto);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    return value;
  }
}
