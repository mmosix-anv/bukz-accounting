import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JobApplicationsService } from './job-applications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('jobs/applications')
@ApiBearerAuth()
@Controller('jobs/applications')
export class JobApplicationsController {
  constructor(private readonly service: JobApplicationsService) {}

  @Roles('candidate')
  @Post()
  apply(
    @Body() body: { jobId: string; coverLetter?: string },
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.apply(user.id, body.jobId, body.coverLetter);
  }

  @Roles('candidate')
  @Get('my')
  findMy(@CurrentUser() user: SupabaseUser) {
    return this.service.findByCandidate(user.id);
  }

  @Roles('employer', 'admin')
  @Get('received')
  findReceived(@CurrentUser() user: SupabaseUser, @Query('status') status?: string) {
    return this.service.findByEmployer(user.id, status);
  }

  @Roles('employer', 'admin')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'submitted' | 'viewed' | 'shortlisted' | 'rejected' | 'offered' },
  ) {
    return this.service.updateStatus(id, body.status);
  }
}
