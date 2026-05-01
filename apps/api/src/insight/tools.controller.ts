import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ToolsService } from './tools.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('insight/tools')
@Controller('insight/tools')
export class ToolsController {
  constructor(private readonly service: ToolsService) {}

  @Public()
  @Post('tax-calculator')
  taxCalculator(@Body() body: { annualIncome: number; pensionContribution?: number }) {
    return this.service.calculateTax(body);
  }

  @Public()
  @Post('ir35-checker')
  ir35Checker(@Body() body: { answers: Record<string, boolean> }) {
    return this.service.checkIr35(body);
  }

  @Public()
  @Get('salary-benchmark')
  salaryBenchmark(@Query('title') title?: string, @Query('location') location?: string, @Query('experienceLevel') experienceLevel?: string) {
    return this.service.getSalaryBenchmark({ title, location, experienceLevel });
  }
}
