import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('users')
  getUsers(@Query('role') role?: string, @Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.service.getUsers(role, Number(limit), Number(offset));
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Query('role') role: string) {
    return this.service.updateUserRole(id, role);
  }

  @Get('payments')
  getPayments(@Query('limit') limit = 30, @Query('offset') offset = 0) {
    return this.service.getPayments(Number(limit), Number(offset));
  }
}
