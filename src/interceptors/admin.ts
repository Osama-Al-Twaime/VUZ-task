import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Role } from 'src/enums';
import { AuthService } from 'src/services';

@Injectable()
export class AdminInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(
    context: ExecutionContext,
    next: import('@nestjs/common').CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    if (!headers.authorization) {
      throw new UnauthorizedException('Token not provided');
    }

    const token = headers.authorization.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const decodedToken = this.authService.verifyToken(token);

      if (decodedToken.userRole !== Role.ADMIN) {
        throw new UnauthorizedException('User Not authorized');
      }

      return next.handle();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
