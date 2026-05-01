import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmployersService } from './employers.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('jobs/employers')
@ApiBearerAuth()
@Roles('employer', 'admin')
@Controller('jobs/employers')
export class EmployersController {
  constructor(private readonly service: EmployersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: SupabaseUser) {
    return this.service.getProfile(user.id);
  }

  @Put('me')
  updateProfile(
    @CurrentUser() user: SupabaseUser,
    @Body() body: Partial<{ bio: string; location: string; websiteUrl: string }>,
  ) {
    return this.service.updateProfile(user.id, body);
  }

  @Get('me/listings')
  getMyListings(@CurrentUser() user: SupabaseUser) {
    return this.service.getMyListings(user.id);
  }

  @Get('me/stats')
  getStats(@CurrentUser() user: SupabaseUser) {
    return this.service.getStats(user.id);
  }
}
