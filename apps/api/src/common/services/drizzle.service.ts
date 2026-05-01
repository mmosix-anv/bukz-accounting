import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@bukz/db';

@Injectable()
export class DrizzleService implements OnModuleInit {
  private _db!: ReturnType<typeof drizzle>;

  onModuleInit() {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    const client = postgres(connectionString);
    this._db = drizzle(client, { schema });
  }

  get db() {
    return this._db;
  }
}
