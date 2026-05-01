import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalaryService } from './salary.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('jobs/salary')
@Controller('jobs/salary')
export class SalaryController {
  constructor(private readonly service: SalaryService) {}

  @Public()
  @Get('benchmark')
  getBenchmark(
    @Query('role') role?: string,
    @Query('location') location?: string,
    @Query('experienceLevel') experienceLevel?: string,
  ) {
    return this.service.getBenchmark({ role, location, experienceLevel });
  }
}
