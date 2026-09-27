import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
      relations: {
        company: true,
      },
    });
  }

  async findById(id: string) {
  return this.userRepository.findOne({
    where: {
      id,
      active: true,
    },
    relations: {
      company: true,
    },
  });
}

  async createAdmin(
    companyId: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      companyId,
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'admin',
      authProvider: 'local',
      active: true,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      role: savedUser.role,
      companyId: savedUser.companyId,
    };
  }
}