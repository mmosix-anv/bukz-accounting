import { Controller, Post, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService, type SupabaseUser } from './auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sync Supabase user to platform DB after login' })
  @Post('sync')
  sync(@CurrentUser() user: SupabaseUser) {
    return this.authService.syncUser(user);
  }

  @ApiOperation({ summary: 'Get current authenticated user with profile' })
  @Get('me')
  getMe(@CurrentUser() user: SupabaseUser) {
    return this.authService.getMe(user.id);
  }

  @ApiOperation({ summary: 'Update current user profile fields' })
  @Put('me/profile')
  updateProfile(
    @CurrentUser() user: SupabaseUser,
    @Body() body: { bio?: string; location?: string; phone?: string; linkedinUrl?: string; websiteUrl?: string },
  ) {
    return this.authService.updateProfile(user.id, body);
  }

  @ApiOperation({ summary: 'Update current user name / avatar' })
  @Put('me')
  updateUser(
    @CurrentUser() user: SupabaseUser,
    @Body() body: { name?: string; avatarUrl?: string },
  ) {
    return this.authService.updateUser(user.id, body);
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
