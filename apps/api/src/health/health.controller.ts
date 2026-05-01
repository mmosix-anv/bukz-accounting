import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { DrizzleService } from '../common/services/drizzle.service';
import { sql } from 'drizzle-orm';

@Controller('health')
export class HealthController {
  constructor(private readonly drizzle: DrizzleService) {}

  @Public()
  @Get()
  async check() {
    let dbStatus: boolean | string = false;
    let redisStatus: boolean | string = false;

    try {
      await this.drizzle.db.execute(sql`SELECT 1`);
      dbStatus = true;
    } catch {
      dbStatus = false;
    }

    try {
      const redisUrl = process.env['UPSTASH_REDIS_REST_URL'];
      if (redisUrl) {
        await fetch(`${redisUrl}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env['UPSTASH_REDIS_REST_TOKEN']}`,
          },
        });
        redisStatus = true;
      } else {
        redisStatus = 'not_configured';
      }
    } catch {
      redisStatus = false;
    }

    return {
      status: dbStatus === true ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        db: dbStatus === true ? 'connected' : 'disconnected',
        redis: redisStatus,
      },
    };
  }
}
