import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('learn/reviews')
@ApiBearerAuth()
@Controller('learn/reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post()
  create(
    @Body() body: { courseId: string; rating: number; body?: string },
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.create(user.id, body.courseId, body.rating, body.body);
  }

  @Public()
  @Get('course/:courseId')
  findByCourse(
    @Param('courseId') courseId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.findByCourse(courseId, Number(limit ?? 20), Number(offset ?? 0));
  }
}
