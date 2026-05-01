import { readFileSync } from 'fs';
import { resolve } from 'path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { algoliasearch } from 'algoliasearch';
import { eq } from 'drizzle-orm';
import * as schema from './src/schema/index';

// ── Env loading ──────────────────────────────────────────────────────────────
function loadEnv(...paths: string[]) {
  for (const filePath of paths) {
    try {
      const content = readFileSync(filePath, 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const idx = line.indexOf('=');
        if (idx <= 0) continue;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) value = value.slice(1, -1);
        if (process.env[key] === undefined) process.env[key] = value;
      }
    } catch { /* skip */ }
  }
}

const root = resolve(__dirname, '..', '..');
loadEnv(resolve(root, '.env.local'), resolve(root, '.env'));

// ── Clients ──────────────────────────────────────────────────────────────────
const client = postgres(process.env['DATABASE_URL']!);
const db = drizzle(client, { schema });

const algolia = algoliasearch(
  process.env['NEXT_PUBLIC_ALGOLIA_APP_ID']!,
  process.env['ALGOLIA_ADMIN_KEY']!,
);

// ── Index settings ───────────────────────────────────────────────────────────
async function configureJobsIndex() {
  console.log('  Configuring bukz_jobs...');
  await algolia.setSettings({
    indexName: 'bukz_jobs',
    indexSettings: {
      searchableAttributes: ['title', 'companyName', 'location', 'description', 'qualifications', 'softwareSkills'],
      attributesForFaceting: ['filterOnly(status)', 'jobType', 'experienceLevel', 'remotePolicy', 'categoryName', 'salaryCurrency'],
      ranking: ['desc(featured)', 'desc(createdAt)', 'typo', 'geo', 'words', 'filters', 'proximity', 'attribute', 'exact', 'custom'],
      customRanking: ['desc(featured)', 'desc(createdAt)'],
    },
  });
}

async function configureLearnIndex() {
  console.log('  Configuring bukz_learn...');
  await algolia.setSettings({
    indexName: 'bukz_learn',
    indexSettings: {
      searchableAttributes: ['title', 'shortDescription', 'instructorName', 'categoryName'],
      attributesForFaceting: ['filterOnly(status)', 'level', 'categoryName'],
      customRanking: ['desc(createdAt)'],
      replicas: ['bukz_learn_rating', 'bukz_learn_enrollments'],
    },
  });

  console.log('  Configuring bukz_learn_rating replica...');
  await algolia.setSettings({
    indexName: 'bukz_learn_rating',
    indexSettings: {
      customRanking: ['desc(ratingAvg)', 'desc(ratingCount)'],
    },
  });

  console.log('  Configuring bukz_learn_enrollments replica...');
  await algolia.setSettings({
    indexName: 'bukz_learn_enrollments',
    indexSettings: {
      customRanking: ['desc(enrollmentsCount)'],
    },
  });
}

// ── Data sync ────────────────────────────────────────────────────────────────
async function syncJobs() {
  console.log('  Syncing jobs...');

  const jobs = await db
    .select({
      id: schema.jobListings.id,
      title: schema.jobListings.title,
      slug: schema.jobListings.slug,
      description: schema.jobListings.description,
      location: schema.jobListings.location,
      salaryMin: schema.jobListings.salaryMin,
      salaryMax: schema.jobListings.salaryMax,
      salaryCurrency: schema.jobListings.salaryCurrency,
      jobType: schema.jobListings.jobType,
      experienceLevel: schema.jobListings.experienceLevel,
      remotePolicy: schema.jobListings.remotePolicy,
      qualifications: schema.jobListings.qualifications,
      softwareSkills: schema.jobListings.softwareSkills,
      status: schema.jobListings.status,
      featured: schema.jobListings.featured,
      createdAt: schema.jobListings.createdAt,
      categoryId: schema.jobListings.categoryId,
      companyName: schema.users.name,
    })
    .from(schema.jobListings)
    .leftJoin(schema.users, eq(schema.jobListings.employerId, schema.users.id))
    .where(eq(schema.jobListings.status, 'active'));

  const categoryIds = [...new Set(jobs.map(j => j.categoryId).filter(Boolean))] as string[];
  const categories = categoryIds.length
    ? await db.select().from(schema.jobCategories).where(
        schema.jobCategories.id.in ? (schema.jobCategories.id as unknown as { in: (ids: string[]) => unknown }).in(categoryIds) : undefined as never
      )
    : [];
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const records = jobs.map(j => ({
    objectID: j.id,
    title: j.title,
    slug: j.slug,
    description: j.description.replace(/<[^>]*>/g, ' ').slice(0, 500),
    location: j.location,
    salaryMin: j.salaryMin ? Number(j.salaryMin) : null,
    salaryMax: j.salaryMax ? Number(j.salaryMax) : null,
    salaryCurrency: j.salaryCurrency,
    jobType: j.jobType,
    experienceLevel: j.experienceLevel,
    remotePolicy: j.remotePolicy,
    qualifications: j.qualifications,
    softwareSkills: j.softwareSkills,
    status: j.status,
    featured: j.featured,
    companyName: j.companyName ?? '',
    categoryName: j.categoryId ? (catMap[j.categoryId] ?? '') : '',
    createdAt: j.createdAt.getTime(),
  }));

  if (records.length > 0) {
    await algolia.saveObjects({ indexName: 'bukz_jobs', objects: records });
    console.log(`    ✓ Indexed ${records.length} job(s)`);
  } else {
    console.log('    No active jobs to index');
  }
}

async function syncCourses() {
  console.log('  Syncing courses...');

  const courses = await db
    .select({
      id: schema.courses.id,
      title: schema.courses.title,
      slug: schema.courses.slug,
      description: schema.courses.description,
      shortDescription: schema.courses.shortDescription,
      thumbnailUrl: schema.courses.thumbnailUrl,
      level: schema.courses.level,
      priceGbp: schema.courses.priceGbp,
      cpdHours: schema.courses.cpdHours,
      status: schema.courses.status,
      enrollmentsCount: schema.courses.enrollmentsCount,
      ratingAvg: schema.courses.ratingAvg,
      ratingCount: schema.courses.ratingCount,
      createdAt: schema.courses.createdAt,
      categoryId: schema.courses.categoryId,
      instructorName: schema.users.name,
    })
    .from(schema.courses)
    .leftJoin(schema.users, eq(schema.courses.instructorId, schema.users.id))
    .where(eq(schema.courses.status, 'published'));

  const catIds = [...new Set(courses.map(c => c.categoryId).filter(Boolean))] as string[];
  const catRows = catIds.length
    ? await db.select().from(schema.courseCategories)
    : [];
  const catMap = Object.fromEntries(catRows.map(c => [c.id, c.name]));

  const records = courses.map(c => ({
    objectID: c.id,
    title: c.title,
    slug: c.slug,
    shortDescription: c.shortDescription,
    thumbnailUrl: c.thumbnailUrl,
    level: c.level,
    priceGbp: Number(c.priceGbp),
    cpdHours: Number(c.cpdHours),
    status: c.status,
    enrollmentsCount: c.enrollmentsCount,
    ratingAvg: c.ratingAvg ? Number(c.ratingAvg) : 0,
    ratingCount: c.ratingCount,
    instructorName: c.instructorName ?? '',
    categoryName: c.categoryId ? (catMap[c.categoryId] ?? '') : '',
    createdAt: c.createdAt.getTime(),
  }));

  if (records.length > 0) {
    await algolia.saveObjects({ indexName: 'bukz_learn', objects: records });
    console.log(`    ✓ Indexed ${records.length} course(s)`);
  } else {
    console.log('    No published courses to index');
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍 Initialising Algolia indices...\n');

  console.log('⚙️  Configuring index settings...');
  await configureJobsIndex();
  await configureLearnIndex();

  console.log('\n📦 Syncing data...');
  await syncJobs();
  await syncCourses();

  console.log('\n✅ Algolia sync complete!\n');
  await client.end();
}

main().catch(err => {
  console.error('\n❌ Algolia sync failed:', err);
  process.exit(1);
});
