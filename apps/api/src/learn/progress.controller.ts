import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('learn/progress')
@ApiBearerAuth()
@Controller('learn/progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Post('lesson')
  markComplete(
    @Body() body: { lessonId: string },
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.markLessonComplete(user.id, body.lessonId);
  }

  @Get('course/:courseId')
  getCourseProgress(@Param('courseId') courseId: string, @CurrentUser() user: SupabaseUser) {
    return this.service.getCourseProgress(user.id, courseId);
  }
}
