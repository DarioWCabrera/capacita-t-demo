import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

type RequestWithUser = Request & {
  user: {
    userId: string;
    companyId: string;
    role: 'admin' | 'employee';
  };
};

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('dashboard')
  getDashboard(@Req() request: RequestWithUser) {
    return this.adminService.getDashboard(
      request.user.companyId,
    );
  }
}