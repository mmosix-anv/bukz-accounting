import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { CpdController } from './cpd.controller';
import { CpdService } from './cpd.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [
    CoursesController,
    EnrollmentsController,
    ProgressController,
    CertificatesController,
    CpdController,
    ReviewsController,
  ],
  providers: [
    CoursesService,
    EnrollmentsService,
    ProgressService,
    CertificatesService,
    CpdService,
    ReviewsService,
  ],
  exports: [CoursesService, EnrollmentsService, CertificatesService],
})
export class LearnModule {}
