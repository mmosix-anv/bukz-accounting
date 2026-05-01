import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CpdService } from './cpd.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('learn/cpd')
@ApiBearerAuth()
@Controller('learn/cpd')
export class CpdController {
  constructor(private readonly service: CpdService) {}

  @Get('my')
  getMyCpdLog(@CurrentUser() user: SupabaseUser) {
    return this.service.getMyCpdLog(user.id);
  }

  @Post('manual')
  logManual(
    @CurrentUser() user: SupabaseUser,
    @Body() body: { hours: number; activityDescription: string; loggedAt?: string },
  ) {
    return this.service.logManual(user.id, {
      hours: body.hours,
      activityDescription: body.activityDescription,
      loggedAt: body.loggedAt ? new Date(body.loggedAt) : undefined,
    });
  }

  @Get('my/summary')
  getSummary(@CurrentUser() user: SupabaseUser) {
    return this.service.getSummary(user.id);
  }
}
