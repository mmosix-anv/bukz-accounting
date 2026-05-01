import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../common/services/drizzle.service';
import { jobListings, profiles } from '@bukz/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class EmployersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getProfile(userId: string) {
    const [profile] = await this.drizzle.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return profile ?? null;
  }

  async updateProfile(
    userId: string,
    data: Partial<{ bio: string; location: string; phone: string; linkedinUrl: string; websiteUrl: string }>,
  ) {
    const [updated] = await this.drizzle.db
      .update(profiles)
      .set(data)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated!;
  }

  async getMyListings(employerId: string) {
    return this.drizzle.db
      .select({
        id: jobListings.id,
        title: jobListings.title,
        slug: jobListings.slug,
        status: jobListings.status,
        applicationsCount: jobListings.applicationsCount,
        viewsCount: jobListings.viewsCount,
        featured: jobListings.featured,
        expiresAt: jobListings.expiresAt,
        createdAt: jobListings.createdAt,
        jobType: jobListings.jobType,
        location: jobListings.location,
        salaryMin: jobListings.salaryMin,
        salaryMax: jobListings.salaryMax,
        salaryCurrency: jobListings.salaryCurrency,
      })
      .from(jobListings)
      .where(eq(jobListings.employerId, employerId));
  }

  async getStats(employerId: string) {
    const listings = await this.getMyListings(employerId);
    return {
      activeListings: listings.filter((l) => l.status === 'active').length,
      totalApplications: listings.reduce((s, l) => s + (l.applicationsCount ?? 0), 0),
      totalViews: listings.reduce((s, l) => s + (l.viewsCount ?? 0), 0),
      totalListings: listings.length,
    };
  }
}
