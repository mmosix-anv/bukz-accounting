import type { MetadataRoute } from 'next';
import { apiFetch } from '@/lib/api';

const BASE = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://bukzaccounting.co.uk';

interface Article { slug: string; publishedAt: string | null }
interface Course { slug: string; updatedAt: string }
interface JobListing { slug: string; updatedAt: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/jobs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/learn`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/insight`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/experts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/tools/tax-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/tools/ir35-checker`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/tools/salary-benchmarker`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/employers/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [articles, courses, jobs] = await Promise.all([
    apiFetch<Article[]>('/insight/articles?limit=100').catch(() => [] as Article[]),
    apiFetch<Course[]>('/learn/courses?limit=100').catch(() => [] as Course[]),
    apiFetch<JobListing[]>('/jobs/listings?limit=100').catch(() => [] as JobListing[]),
  ]);

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/insight/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE}/learn/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((j) => ({
    url: `${BASE}/jobs/${j.slug}`,
    lastModified: new Date(j.updatedAt),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes, ...courseRoutes, ...jobRoutes];
}
