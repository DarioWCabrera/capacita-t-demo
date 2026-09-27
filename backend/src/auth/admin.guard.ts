import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

type RequestWithUser = Request & {
  user: {
    userId: string;
    companyId: string;
    role: 'admin' | 'employee';
  };
};

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser>();

    if (!request.user || request.user.role !== 'admin') {
      throw new ForbiddenException(
        'No tenés permisos para acceder a esta sección',
      );
    }

    return true;
  }
}