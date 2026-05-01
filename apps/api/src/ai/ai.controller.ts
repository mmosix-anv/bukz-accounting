import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Get('job-matches')
  matchJobs(@CurrentUser() user: SupabaseUser, @Query('limit') limit?: string) {
    return this.service.matchJobsForCandidate(user.id, limit ? Number(limit) : 10);
  }

  @Post('embed/candidate/:id')
  generateEmbedding(@Param('id') id: string) {
    return this.service.generateCandidateEmbedding(id);
  }

  @Get('skills-gap')
  analyseSkillsGap(@CurrentUser() user: SupabaseUser) {
    return this.service.analyseSkillsGap(user.id);
  }

  @Get('recommendations/jobs')
  getJobRecommendations(@CurrentUser() user: SupabaseUser, @Query('limit') limit?: string) {
    return this.service.getJobRecommendations(user.id, limit ? Number(limit) : 6);
  }

  @Get('recommendations/courses')
  getCourseRecommendations(@CurrentUser() user: SupabaseUser, @Query('limit') limit?: string) {
    return this.service.getCourseRecommendations(user.id, limit ? Number(limit) : 6);
  }

  @Get('recommendations/articles')
  getArticleRecommendations(@CurrentUser() user: SupabaseUser, @Query('limit') limit?: string) {
    return this.service.getArticleRecommendations(user.id, limit ? Number(limit) : 4);
  }
}
