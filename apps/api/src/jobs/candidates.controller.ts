import { Controller, Get, Put, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { SkillsGapService } from './skills-gap.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('jobs/candidates')
@ApiBearerAuth()
@Roles('candidate')
@Controller('jobs/candidates')
export class CandidatesController {
  constructor(
    private readonly service: CandidatesService,
    private readonly skillsGap: SkillsGapService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: SupabaseUser) {
    return this.service.findByUserId(user.id);
  }

  @Put('me')
  update(
    @CurrentUser() user: SupabaseUser,
    @Body() body: Partial<typeof import('@bukz/db').candidates.$inferInsert>,
  ) {
    return this.service.upsert(user.id, body);
  }

  @Post('me/cv-upload-url')
  getCvUploadUrl(
    @CurrentUser() user: SupabaseUser,
    @Body() body: { filename: string; contentType: string },
  ) {
    return this.service.getCvUploadUrl(user.id, body.filename, body.contentType);
  }

  @Post('me/cv-confirm')
  confirmCv(
    @CurrentUser() user: SupabaseUser,
    @Body() body: { key: string; filename: string },
  ) {
    return this.service.confirmCvUpload(user.id, body.key, body.filename);
  }

  @Get('me/skills-gap')
  async getSkillsGap(@CurrentUser() user: SupabaseUser): Promise<unknown> {
    return this.skillsGap.analyse(user.id);
  }
}
