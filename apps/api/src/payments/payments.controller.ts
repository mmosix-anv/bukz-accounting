import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { SubscriptionTier } from '../common/decorators/subscription-tier.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Roles('employer', 'admin')
  @Get('employer-subscription')
  getEmployerSubscription(@CurrentUser() user: { id: string }) {
    return this.service.getEmployerSubscription(user.id);
  }

  @Roles('employer', 'admin')
  @Post('employer-subscription-checkout')
  createEmployerSubscriptionCheckout(
    @Body() body: { tier: Exclude<SubscriptionTier, 'free'> },
    @CurrentUser() user: { id: string },
  ) {
    return this.service.createEmployerSubscriptionCheckout(user.id, body.tier);
  }

  @Post('job-checkout')
  createJobCheckout(
    @Body() body: { packageType: 'single' | 'triple' | 'monthly' },
    @CurrentUser() user: { id: string },
  ) {
    return this.service.createJobPostingCheckout(user.id, body.packageType);
  }

  @Post('course-checkout')
  createCourseCheckout(
    @Body() body: { courseId: string; priceGbp: number },
    @CurrentUser() user: { id: string },
  ) {
    return this.service.createCourseCheckout(user.id, body.courseId, body.priceGbp);
  }
}
