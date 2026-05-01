import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('insight/articles')
@ApiBearerAuth()
@Controller('insight/articles')
export class ArticlesController {
  constructor(private readonly service: ArticlesService) {}

  @Public()
  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('featuredFirst') featuredFirst?: string,
  ) {
    return this.service.findAll(
      Number(limit ?? 20),
      Number(offset ?? 0),
      categoryId,
      search,
      featuredFirst !== 'false',
    );
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Roles('admin')
  @Post()
  create(
    @Body() body: typeof import('@bukz/db').articles.$inferInsert,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.create({ ...body, authorId: user.id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<typeof import('@bukz/db').articles.$inferInsert>,
    @CurrentUser() user: { id: string; role?: string },
  ) {
    return this.service.update(id, body, user.id, user.role === 'admin');
  }

  @Post(':id/publish')
  publish(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role?: string },
  ) {
    return this.service.publish(id, user.id, user.role === 'admin');
  }
}
