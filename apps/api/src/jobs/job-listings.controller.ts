import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobListingsService } from './job-listings.service';
import { SearchSyncService } from '../search/search-sync.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('jobs/listings')
@ApiBearerAuth()
@Controller('jobs/listings')
export class JobListingsController {
  constructor(
    private readonly service: JobListingsService,
    private readonly search: SearchSyncService,
  ) {}

  @Public()
  @ApiQuery({ name: 'jobType', required: false })
  @ApiQuery({ name: 'experienceLevel', required: false })
  @ApiQuery({ name: 'remotePolicy', required: false })
  @ApiQuery({ name: 'salaryMin', required: false })
  @ApiQuery({ name: 'salaryMax', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @Get()
  findAll(
    @Query('jobType') jobType?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('remotePolicy') remotePolicy?: string,
    @Query('salaryMin') salaryMin?: string,
    @Query('salaryMax') salaryMax?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.findAll({
      jobType: jobType?.split(','),
      experienceLevel: experienceLevel?.split(','),
      remotePolicy: remotePolicy?.split(','),
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Public()
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const listing = await this.service.findBySlug(slug);
    this.service.incrementViews(listing.id).catch(() => undefined);
    return listing;
  }

  @Roles('employer', 'admin')
  @Post()
  async create(
    @Body() body: Omit<typeof import('@bukz/db').jobListings.$inferInsert, 'employerId' | 'slug'>,
    @CurrentUser() user: SupabaseUser,
  ) {
    const listing = await this.service.create({ ...body, employerId: user.id, slug: '' });
    this.search.syncJobListing(listing as Record<string, unknown>).catch(() => undefined);
    return listing;
  }

  @Roles('employer', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<typeof import('@bukz/db').jobListings.$inferInsert>,
    @CurrentUser() user: SupabaseUser,
  ) {
    const isAdmin = user.user_metadata?.['role'] === 'admin';
    const listing = await this.service.update(id, user.id, body, isAdmin);
    this.search.syncJobListing(listing as Record<string, unknown>).catch(() => undefined);
    return listing;
  }

  @Roles('employer', 'admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: SupabaseUser) {
    const isAdmin = user.user_metadata?.['role'] === 'admin';
    const listing = await this.service.softDelete(id, user.id, isAdmin);
    this.search.deleteJobListing(id).catch(() => undefined);
    return listing;
  }

  @Roles('admin')
  @Post(':id/feature')
  feature(@Param('id') id: string, @Body() body: { featured: boolean }) {
    return this.service.markFeatured(id, body.featured);
  }
}
