import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !user.active ||
      !user.company.active ||
      !user.passwordHash
    ) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    return {
      accessToken,
      user: {
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
      },
    };
  }
}