import { Injectable } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';

interface AlgoliaClient {
  saveObject(params: { indexName: string; body: Record<string, unknown> }): Promise<unknown>;
  deleteObject(params: { indexName: string; objectID: string }): Promise<unknown>;
}

@Injectable()
export class SearchSyncService {
  private client: AlgoliaClient | null = null;

  constructor(private readonly logger: LoggerService) {
    this.initClient();
  }

  private initClient() {
    const appId = process.env['NEXT_PUBLIC_ALGOLIA_APP_ID'];
    const adminKey = process.env['ALGOLIA_ADMIN_KEY'];

    if (!appId || !adminKey) {
      this.logger.warn('Algolia credentials not set — search sync disabled', SearchSyncService.name);
      return;
    }

    import('algoliasearch')
      .then(({ algoliasearch }) => {
        this.client = algoliasearch(appId, adminKey) as unknown as AlgoliaClient;
        this.logger.log('Algolia client initialised', SearchSyncService.name);
      })
      .catch((err: unknown) => {
        this.logger.error('Failed to init Algolia', String(err), SearchSyncService.name);
      });
  }

  async syncJobListing(listing: Record<string, unknown>) {
    if (!this.client) return;

    try {
      await this.client.saveObject({
        indexName: 'bukz_jobs',
        body: {
          objectID: listing['id'],
          title: listing['title'],
          description: String(listing['description'] ?? '').slice(0, 2000),
          location: listing['location'],
          jobType: listing['jobType'],
          experienceLevel: listing['experienceLevel'],
          remotePolicy: listing['remotePolicy'],
          salaryMin: listing['salaryMin'],
          salaryMax: listing['salaryMax'],
          salaryCurrency: listing['salaryCurrency'] ?? 'GBP',
          qualifications: listing['qualifications'],
          softwareSkills: listing['softwareSkills'],
          featured: listing['featured'],
          slug: listing['slug'],
          createdAt: listing['createdAt'],
        },
      });
      this.logger.log(`Synced job ${listing['id']} to Algolia`, SearchSyncService.name);
    } catch (err: unknown) {
      this.logger.error(`Algolia sync failed for job ${listing['id']}`, String(err), SearchSyncService.name);
    }
  }

  async deleteJobListing(id: string) {
    if (!this.client) return;

    try {
      await this.client.deleteObject({ indexName: 'bukz_jobs', objectID: id });
      this.logger.log(`Removed job ${id} from Algolia`, SearchSyncService.name);
    } catch (err: unknown) {
      this.logger.error(`Algolia delete failed for job ${id}`, String(err), SearchSyncService.name);
    }
  }

  async syncCourse(course: Record<string, unknown>) {
    if (!this.client) return;

    try {
      await this.client.saveObject({
        indexName: 'bukz_learn',
        body: {
          objectID: course['id'],
          title: course['title'],
          description: String(course['description'] ?? '').slice(0, 2000),
          level: course['level'],
          priceGbp: course['priceGbp'],
          cpdHours: course['cpdHours'],
          slug: course['slug'],
          enrollmentsCount: course['enrollmentsCount'],
          ratingAvg: course['ratingAvg'],
        },
      });
    } catch (err: unknown) {
      this.logger.error(`Algolia sync failed for course ${course['id']}`, String(err), SearchSyncService.name);
    }
  }
}
