import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ExpertsController } from './experts.controller';
import { ExpertsService } from './experts.service';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';

@Module({
  controllers: [ArticlesController, ExpertsController, ToolsController],
  providers: [ArticlesService, ExpertsService, ToolsService],
  exports: [ArticlesService],
})
export class InsightModule {}
