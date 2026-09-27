import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(
  @Req()
  request: Request & {
    user: {
      userId: string;
      companyId: string;
      role: 'admin' | 'employee';
    };
  },
) {
    const user = await this.usersService.findById(
      request.user.userId,
    );

    if (!user || !user.company.active) {
      throw new UnauthorizedException('Usuario no disponible');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,

      company: {
        id: user.company.id,
        name: user.company.name,
        legalName: user.company.legalName,
        logoUrl: user.company.logoUrl,
        primaryColor: user.company.primaryColor,
        secondaryColor: user.company.secondaryColor,
      },
    };
  }
}