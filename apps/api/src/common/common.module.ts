import { Module, Global } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { StorageService } from './services/storage.service';
import { DrizzleService } from './services/drizzle.service';

@Global()
@Module({
  providers: [LoggerService, StorageService, DrizzleService],
  exports: [LoggerService, StorageService, DrizzleService],
})
export class CommonModule {}
