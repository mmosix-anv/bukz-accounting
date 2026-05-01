import { Module, Global } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { StorageService } from './services/storage.service';
import { DrizzleService } from './services/drizzle.service';
import { EmailService } from './services/email.service';

@Global()
@Module({
  providers: [LoggerService, StorageService, DrizzleService, EmailService],
  exports: [LoggerService, StorageService, DrizzleService, EmailService],
})
export class CommonModule {}
