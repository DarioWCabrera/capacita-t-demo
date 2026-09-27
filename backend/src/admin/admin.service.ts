import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getDashboard(companyId: string) {
    return {
      companyId,
      message: 'Dashboard administrativo protegido correctamente',
    };
  }
}