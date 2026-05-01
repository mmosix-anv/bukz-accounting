import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { SupabaseUser } from '../auth/auth.service';

@ApiTags('learn/courses')
@ApiBearerAuth()
@Controller('learn/courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Public()
  @Get()
  findAll(
    @Query('level') level?: string,
    @Query('priceMax') priceMax?: string,
    @Query('cpdHoursMin') cpdHoursMin?: string,
    @Query('sortBy') sortBy?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.service.findAll({
      level: level?.split(','),
      priceMax: priceMax ? Number(priceMax) : undefined,
      cpdHoursMin: cpdHoursMin ? Number(cpdHoursMin) : undefined,
      sortBy: sortBy as 'newest' | 'rating' | 'enrollments' | 'recommended' | undefined,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.service.getCourseCategories();
  }

  @Get('instructor/my')
  @Roles('instructor', 'admin')
  getMyCoursesAsInstructor(@CurrentUser() user: SupabaseUser) {
    return this.service.getInstructorCourses(user.id);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string, @CurrentUser() user?: SupabaseUser) {
    return this.service.findBySlug(slug, user?.id);
  }

  @Roles('instructor', 'admin')
  @Post()
  create(
    @Body() body: Omit<typeof import('@bukz/db').courses.$inferInsert, 'instructorId' | 'slug'>,
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.create(user.id, body);
  }

  @Roles('instructor', 'admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<typeof import('@bukz/db').courses.$inferInsert>,
    @CurrentUser() user: SupabaseUser,
  ) {
    const isAdmin = user.user_metadata?.['role'] === 'admin';
    return this.service.update(id, user.id, body, isAdmin);
  }

  @Roles('instructor', 'admin')
  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: SupabaseUser) {
    return this.service.publish(id, user.id);
  }

  @Roles('instructor', 'admin')
  @Post(':id/unpublish')
  unpublish(@Param('id') id: string, @CurrentUser() user: SupabaseUser) {
    return this.service.unpublish(id, user.id);
  }

  @Roles('instructor', 'admin')
  @Get(':id/analytics')
  analytics(@Param('id') id: string, @CurrentUser() user: SupabaseUser) {
    return this.service.getAnalytics(id, user.id);
  }

  @Roles('instructor', 'admin')
  @Post(':courseId/sections')
  createSection(
    @Param('courseId') courseId: string,
    @Body() body: { title: string },
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.createSection(courseId, user.id, body.title);
  }

  @Roles('instructor', 'admin')
  @Patch('sections/:sectionId')
  updateSection(
    @Param('sectionId') sectionId: string,
    @Body() body: { title?: string; position?: number },
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.updateSection(sectionId, user.id, body);
  }

  @Roles('instructor', 'admin')
  @Post('sections/:sectionId/lessons')
  createLesson(
    @Param('sectionId') sectionId: string,
    @Body() body: Omit<typeof import('@bukz/db').courseLessons.$inferInsert, 'sectionId' | 'position'>,
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.createLesson(sectionId, user.id, body);
  }

  @Roles('instructor', 'admin')
  @Patch('lessons/:lessonId')
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() body: Partial<typeof import('@bukz/db').courseLessons.$inferInsert>,
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.updateLesson(lessonId, user.id, body);
  }

  @Roles('instructor', 'admin')
  @Post('sections/:sectionId/reorder')
  reorderLessons(
    @Param('sectionId') sectionId: string,
    @Body() body: { orderedIds: string[] },
    @CurrentUser() user: SupabaseUser,
  ) {
    return this.service.reorderLessons(sectionId, user.id, body.orderedIds);
  }
}
