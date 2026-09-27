import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Controller('companies')
export class CompaniesController {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  @Get()
  findAll() {
    return this.companyRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });
  }
}