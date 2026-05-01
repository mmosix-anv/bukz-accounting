import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('learn/enrollments')
@ApiBearerAuth()
@Controller('learn/enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Post()
  enrol(
    @Body() body: { courseId: string; stripePaymentIntentId?: string },
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.enrol(user.id, body.courseId, body.stripePaymentIntentId);
  }

  @Get('my')
  findMy(@CurrentUser() user: SupabaseUser) {
    return this.service.findByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: SupabaseUser) {
    return this.service.findById(id, user.id);
  }
}
