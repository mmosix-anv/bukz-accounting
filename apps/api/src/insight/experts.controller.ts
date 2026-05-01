import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExpertsService } from './experts.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('insight/experts')
@ApiBearerAuth()
@Controller('insight/experts')
export class ExpertsController {
  constructor(private readonly service: ExpertsService) {}

  @Public()
  @Get()
  findAll(@Query('specialisation') specialisation?: string) {
    return this.service.findAll(specialisation);
  }

  @Public()
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.service.findByUsername(username);
  }

  @Roles('admin')
  @Post()
  create(@Body() body: typeof import('@bukz/db').experts.$inferInsert) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<typeof import('@bukz/db').experts.$inferInsert>,
    @CurrentUser() user: { id: string; role?: string },
  ) {
    return this.service.update(id, body, user.id, user.role === 'admin');
  }
}
