import { Module } from '@nestjs/common';
import { JobListingsController } from './job-listings.controller';
import { JobListingsService } from './job-listings.service';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { EmployersController } from './employers.controller';
import { EmployersService } from './employers.service';
import { SalaryController } from './salary.controller';
import { SalaryService } from './salary.service';
import { SkillsGapService } from './skills-gap.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [
    JobListingsController,
    JobApplicationsController,
    CandidatesController,
    EmployersController,
    SalaryController,
  ],
  providers: [
    JobListingsService,
    JobApplicationsService,
    CandidatesService,
    EmployersService,
    SalaryService,
    SkillsGapService,
  ],
  exports: [JobListingsService, CandidatesService],
})
export class JobsModule {}
