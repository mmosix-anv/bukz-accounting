import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { employerSubscriptions, jobListings } from '@bukz/db';
import { eq, and, gte, lte, desc, inArray, sql } from 'drizzle-orm';

export interface JobListingsFilter {
  category?: string;
  location?: string;
  jobType?: string[];
  experienceLevel?: string[];
  remotePolicy?: string[];
  salaryMin?: number;
  salaryMax?: number;
  status?: 'active' | 'draft' | 'expired' | 'filled';
  limit?: number;
  offset?: number;
}

@Injectable()
export class JobListingsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(filter: JobListingsFilter = {}) {
    const {
      jobType,
      experienceLevel,
      remotePolicy,
      salaryMin,
      salaryMax,
      limit = 20,
      offset = 0,
    } = filter;

    const conditions = [eq(jobListings.status, filter.status ?? 'active')];

    if (jobType?.length) {
      conditions.push(
        inArray(jobListings.jobType, jobType as ('full_time' | 'part_time' | 'contract' | 'interim' | 'graduate')[]),
      );
    }
    if (experienceLevel?.length) {
      conditions.push(
        inArray(jobListings.experienceLevel, experienceLevel as ('entry' | 'mid' | 'senior' | 'director' | 'cfo')[]),
      );
    }
    if (remotePolicy?.length) {
      conditions.push(
        inArray(jobListings.remotePolicy, remotePolicy as ('office' | 'hybrid' | 'remote')[]),
      );
    }
    if (salaryMin !== undefined) {
      conditions.push(gte(jobListings.salaryMin, String(salaryMin)));
    }
    if (salaryMax !== undefined) {
      conditions.push(lte(jobListings.salaryMax, String(salaryMax)));
    }

    return this.drizzle.db
      .select()
      .from(jobListings)
      .where(and(...conditions))
      .orderBy(desc(jobListings.featured), desc(jobListings.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findBySlug(slug: string) {
    const [listing] = await this.drizzle.db
      .select()
      .from(jobListings)
      .where(eq(jobListings.slug, slug))
      .limit(1);

    if (!listing) throw new NotFoundException(`Job listing not found: ${slug}`);
    return listing;
  }

  async findById(id: string) {
    const [listing] = await this.drizzle.db
      .select()
      .from(jobListings)
      .where(eq(jobListings.id, id))
      .limit(1);

    if (!listing) throw new NotFoundException(`Job listing not found: ${id}`);
    return listing;
  }

  async create(data: typeof jobListings.$inferInsert) {
    await this.assertEmployerCanCreateListing(data.employerId);
    const slug = this.slugify(data.title ?? '') + '-' + Date.now();
    const [listing] = await this.drizzle.db
      .insert(jobListings)
      .values({ ...data, slug })
      .returning();
    return listing!;
  }

  async update(id: string, employerId: string, data: Partial<typeof jobListings.$inferInsert>, isAdmin = false) {
    const existing = await this.findById(id);

    if (!isAdmin && existing.employerId !== employerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    const [updated] = await this.drizzle.db
      .update(jobListings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobListings.id, id))
      .returning();
    return updated!;
  }

  async softDelete(id: string, employerId: string, isAdmin = false) {
    return this.update(id, employerId, { status: 'expired' }, isAdmin);
  }

  async markFeatured(id: string, featured: boolean) {
    const [updated] = await this.drizzle.db
      .update(jobListings)
      .set({ featured, updatedAt: new Date() })
      .where(eq(jobListings.id, id))
      .returning();
    return updated!;
  }

  async incrementViews(id: string) {
    await this.drizzle.db
      .update(jobListings)
      .set({ viewsCount: sql`${jobListings.viewsCount} + 1` })
      .where(eq(jobListings.id, id));
  }

  async incrementApplications(id: string) {
    await this.drizzle.db
      .update(jobListings)
      .set({ applicationsCount: sql`${jobListings.applicationsCount} + 1` })
      .where(eq(jobListings.id, id));
  }

  async findByEmployer(employerId: string) {
    return this.drizzle.db
      .select()
      .from(jobListings)
      .where(eq(jobListings.employerId, employerId))
      .orderBy(desc(jobListings.createdAt));
  }

  async getEmployerStats(employerId: string) {
    const listings = await this.findByEmployer(employerId);
    const active = listings.filter((l) => l.status === 'active');
    const totalApplications = listings.reduce((sum, l) => sum + (l.applicationsCount ?? 0), 0);
    const totalViews = listings.reduce((sum, l) => sum + (l.viewsCount ?? 0), 0);

    return {
      totalListings: listings.length,
      activeListings: active.length,
      totalApplications,
      totalViews,
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }

  private async assertEmployerCanCreateListing(employerId: string) {
    const [subscription] = await this.drizzle.db
      .select()
      .from(employerSubscriptions)
      .where(eq(employerSubscriptions.userId, employerId))
      .limit(1);

    if (subscription?.status && subscription.status !== 'active') {
      throw new ForbiddenException('Active subscription required');
    }

    const limit = subscription?.activeListingsLimit ?? 1;
    const activeListings = await this.drizzle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobListings)
      .where(and(eq(jobListings.employerId, employerId), eq(jobListings.status, 'active')));

    if ((activeListings[0]?.count ?? 0) >= limit) {
      throw new ForbiddenException('Active job listing limit reached for subscription tier');
    }
  }
}
