import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
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

  // ── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  getUsers(@Query('role') role?: string, @Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.service.getUsers(role, Number(limit), Number(offset));
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Query('role') role: string) {
    return this.service.updateUserRole(id, role);
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  @Get('payments')
  getPayments(@Query('limit') limit = 30, @Query('offset') offset = 0) {
    return this.service.getPayments(Number(limit), Number(offset));
  }

  // ── Articles ──────────────────────────────────────────────────────────────

  @Get('articles')
  getArticles(@Query('status') status?: string, @Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.service.getArticles(status, Number(limit), Number(offset));
  }

  @Patch('articles/:id')
  updateArticle(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateArticle(id, body as never);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string) {
    return this.service.deleteArticle(id);
  }

  // ── Experts ───────────────────────────────────────────────────────────────

  @Get('experts')
  getExperts(@Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.service.getExperts(Number(limit), Number(offset));
  }

  @Patch('experts/:id')
  updateExpert(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateExpert(id, body as never);
  }

  @Post('experts/:id/verify')
  verifyExpert(@Param('id') id: string) {
    return this.service.verifyExpert(id);
  }

  // ── Job listings ──────────────────────────────────────────────────────────

  @Get('jobs')
  getJobListings(@Query('status') status?: string, @Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.service.getJobListings(status, Number(limit), Number(offset));
  }

  @Patch('jobs/:id')
  updateJobListing(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateJobListing(id, body as never);
  }

  @Delete('jobs/:id')
  deleteJobListing(@Param('id') id: string) {
    return this.service.deleteJobListing(id);
  }
}
