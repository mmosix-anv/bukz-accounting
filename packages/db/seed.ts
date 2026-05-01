import { readFileSync } from 'fs';
import { resolve } from 'path';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
import * as schema from './src/schema/index';

// ── Env loading (same as drizzle.config.ts) ────────────────────────────────
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
        ) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = value;
      }
    } catch { /* skip missing files */ }
  }
}

const root = resolve(__dirname, '..', '..');
loadEnv(resolve(root, '.env.local'), resolve(root, '.env'));

// ── Clients ─────────────────────────────────────────────────────────────────
const client = postgres(process.env['DATABASE_URL']!);
const db = drizzle(client, { schema });

const supabaseAdmin = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// ── Helpers ──────────────────────────────────────────────────────────────────
async function createAuthUser(email: string, password: string, name: string, role: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });

  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already exists')) {
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
      const user = existing?.users.find(u => u.email === email);
      if (user) {
        console.log(`  ↩  ${email} already exists (${user.id})`);
        return user.id;
      }
    }
    throw new Error(`Failed to create ${email}: ${error.message}`);
  }

  console.log(`  ✓  Created auth user: ${email} (${data.user.id})`);
  return data.user.id;
}

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Seeding BUKZ database...\n');

  // ── 1. Auth users ──────────────────────────────────────────────────────
  console.log('👤 Creating users in Supabase Auth...');

  const adminId = await createAuthUser('admin@bukz.com', 'Admin1234!', 'Platform Admin', 'admin');
  const employerId = await createAuthUser('employer@acmecorp.com', 'Test1234!', 'ACME Corp', 'employer');
  const instructorId = await createAuthUser('instructor@bukz.com', 'Test1234!', 'James Richardson', 'instructor');
  const candidateId = await createAuthUser('candidate@example.com', 'Test1234!', 'Sarah Johnson', 'candidate');

  // ── 2. Users table ─────────────────────────────────────────────────────
  console.log('\n🗄️  Inserting users into DB...');

  await db.insert(schema.users).values([
    { id: adminId, email: 'admin@bukz.com', name: 'Platform Admin', role: 'admin' },
    { id: employerId, email: 'employer@acmecorp.com', name: 'ACME Corp', role: 'employer' },
    { id: instructorId, email: 'instructor@bukz.com', name: 'James Richardson', role: 'instructor' },
    { id: candidateId, email: 'candidate@example.com', name: 'Sarah Johnson', role: 'candidate' },
  ]).onConflictDoNothing();

  await db.insert(schema.profiles).values([
    { userId: adminId, bio: 'Platform administrator', location: 'London, UK' },
    { userId: employerId, bio: 'Hiring great accounting talent.', location: 'London, UK', websiteUrl: 'https://acmecorp.com' },
    { userId: instructorId, bio: 'Chartered Accountant with 15 years in finance education.', location: 'Manchester, UK', linkedinUrl: 'https://linkedin.com/in/jrichardson' },
    { userId: candidateId, bio: 'Part-qualified ACCA candidate looking for my next role.', location: 'Birmingham, UK' },
  ]).onConflictDoNothing();

  // ── 3. Employer subscription ───────────────────────────────────────────
  await db.insert(schema.employerSubscriptions).values({
    userId: employerId,
    tier: 'starter',
    status: 'active',
    activeListingsLimit: 5,
  }).onConflictDoNothing();

  // ── 4. Job categories ──────────────────────────────────────────────────
  console.log('\n📂 Seeding job categories...');

  const jobCategoryRows = await db.insert(schema.jobCategories).values([
    { name: 'Financial Reporting', slug: 'financial-reporting' },
    { name: 'Audit & Assurance', slug: 'audit-assurance' },
    { name: 'Tax & Compliance', slug: 'tax-compliance' },
    { name: 'Management Accounting', slug: 'management-accounting' },
    { name: 'Corporate Finance', slug: 'corporate-finance' },
    { name: 'Payroll', slug: 'payroll' },
    { name: 'Bookkeeping & Accounts', slug: 'bookkeeping-accounts' },
  ]).onConflictDoNothing().returning({ id: schema.jobCategories.id, slug: schema.jobCategories.slug });

  const jobCategoryMap: Record<string, string> = {};
  for (const row of jobCategoryRows) {
    jobCategoryMap[row.slug] = row.id;
  }

  // If categories already existed, fetch them
  if (Object.keys(jobCategoryMap).length === 0) {
    const existing = await db.select().from(schema.jobCategories);
    for (const row of existing) jobCategoryMap[row.slug] = row.id;
  }

  // ── 5. Job listings ────────────────────────────────────────────────────
  console.log('\n💼 Seeding job listings...');

  await db.insert(schema.jobListings).values([
    {
      employerId,
      title: 'Management Accountant',
      slug: 'management-accountant-acme-corp',
      description: `<p>ACME Corp is seeking a driven Management Accountant to join our growing finance team in London. You will be responsible for producing monthly management accounts, variance analysis, and supporting the FD with board reporting.</p><p><strong>Responsibilities:</strong></p><ul><li>Produce monthly management accounts and KPI reports</li><li>Budget preparation and rolling forecasts</li><li>Variance analysis and commentary</li><li>Support year-end statutory accounts preparation</li></ul>`,
      categoryId: jobCategoryMap['management-accounting'],
      location: 'London, UK',
      salaryMin: '45000',
      salaryMax: '55000',
      salaryCurrency: 'GBP',
      jobType: 'full_time',
      experienceLevel: 'mid',
      remotePolicy: 'hybrid',
      qualifications: ['CIMA', 'ACCA', 'ACA'],
      softwareSkills: ['Xero', 'Excel', 'Power BI'],
      status: 'active',
      featured: true,
    },
    {
      employerId,
      title: 'Financial Controller',
      slug: 'financial-controller-acme-corp',
      description: `<p>We are looking for an experienced Financial Controller to lead our finance function. The successful candidate will oversee all financial operations, manage a small team, and report directly to the CFO.</p><p><strong>Key responsibilities:</strong></p><ul><li>Ownership of month-end close process</li><li>Statutory accounts preparation</li><li>Management of external audit relationship</li><li>Treasury and cash flow management</li><li>Line management of 3 junior finance staff</li></ul>`,
      categoryId: jobCategoryMap['financial-reporting'],
      location: 'London, UK',
      salaryMin: '70000',
      salaryMax: '85000',
      salaryCurrency: 'GBP',
      jobType: 'full_time',
      experienceLevel: 'senior',
      remotePolicy: 'hybrid',
      qualifications: ['ACA', 'ACCA', 'CIMA'],
      softwareSkills: ['SAP', 'Excel', 'Hyperion'],
      status: 'active',
      featured: true,
    },
    {
      employerId,
      title: 'Graduate Trainee Accountant',
      slug: 'graduate-trainee-accountant-acme-corp',
      description: `<p>An exciting opportunity for a recent graduate to join our finance graduate scheme. Full AAT study support provided with progression to CIMA or ACCA.</p><ul><li>Assisting with purchase ledger and accounts payable</li><li>Bank reconciliations</li><li>Supporting month-end processes</li><li>Study leave and exam fees fully covered</li></ul>`,
      categoryId: jobCategoryMap['bookkeeping-accounts'],
      location: 'Manchester, UK',
      salaryMin: '24000',
      salaryMax: '28000',
      salaryCurrency: 'GBP',
      jobType: 'graduate',
      experienceLevel: 'entry',
      remotePolicy: 'office',
      qualifications: [],
      softwareSkills: ['Excel'],
      status: 'active',
      featured: false,
    },
  ]).onConflictDoNothing();

  // ── 6. Candidate profile ───────────────────────────────────────────────
  console.log('\n🧑‍💼 Seeding candidate profile...');

  await db.insert(schema.candidates).values({
    userId: candidateId,
    headline: 'Part-Qualified ACCA | Management Accounts | Excel',
    yearsExperience: 3,
    currentSalary: '38000',
    desiredSalary: '45000',
    noticePeriod: '1 month',
    qualifications: ['ACCA Part-Qualified'],
    softwareSkills: ['Xero', 'QuickBooks', 'Excel', 'Sage'],
    openToWork: true,
  }).onConflictDoNothing();

  // ── 7. Course categories ───────────────────────────────────────────────
  console.log('\n📚 Seeding course categories...');

  const courseCategoryRows = await db.insert(schema.courseCategories).values([
    { name: 'AAT Qualifications', slug: 'aat' },
    { name: 'CIMA', slug: 'cima' },
    { name: 'ACCA', slug: 'acca' },
    { name: 'Tax', slug: 'tax' },
    { name: 'Payroll', slug: 'payroll' },
    { name: 'Excel & Accounting Software', slug: 'excel-software' },
    { name: 'Financial Management', slug: 'financial-management' },
  ]).onConflictDoNothing().returning({ id: schema.courseCategories.id, slug: schema.courseCategories.slug });

  const courseCategoryMap: Record<string, string> = {};
  for (const row of courseCategoryRows) {
    courseCategoryMap[row.slug] = row.id;
  }
  if (Object.keys(courseCategoryMap).length === 0) {
    const existing = await db.select().from(schema.courseCategories);
    for (const row of existing) courseCategoryMap[row.slug] = row.id;
  }

  // ── 8. Courses ─────────────────────────────────────────────────────────
  console.log('\n🎓 Seeding courses...');

  const courseRows = await db.insert(schema.courses).values([
    {
      instructorId,
      title: 'Introduction to Management Accounts',
      slug: 'intro-management-accounts',
      description: 'A comprehensive introduction to producing management accounts from scratch. Covers the full month-end process, variance analysis, and presenting results to non-finance stakeholders.',
      shortDescription: 'Learn to produce monthly management accounts from scratch with confidence.',
      categoryId: courseCategoryMap['financial-management'],
      level: 'beginner',
      priceGbp: '149.00',
      cpdHours: '8.0',
      status: 'published',
      enrollmentsCount: 0,
    },
    {
      instructorId,
      title: 'Advanced Excel for Accountants',
      slug: 'advanced-excel-accountants',
      description: 'Master the Excel features used daily by finance professionals: VLOOKUP, INDEX/MATCH, pivot tables, Power Query, and dynamic arrays. Includes practical exercises using real accounting data.',
      shortDescription: 'Become an Excel power user with finance-specific skills and templates.',
      categoryId: courseCategoryMap['excel-software'],
      level: 'intermediate',
      priceGbp: '99.00',
      cpdHours: '6.0',
      status: 'published',
      enrollmentsCount: 0,
    },
    {
      instructorId,
      title: 'UK Corporation Tax Fundamentals',
      slug: 'uk-corporation-tax-fundamentals',
      description: 'A practical guide to UK corporation tax for accounting professionals. Covers chargeable gains, loss relief, group relief, and CT600 preparation.',
      shortDescription: 'Understand UK corporation tax legislation and prepare CT600 returns with confidence.',
      categoryId: courseCategoryMap['tax'],
      level: 'intermediate',
      priceGbp: '179.00',
      cpdHours: '10.0',
      status: 'published',
      enrollmentsCount: 0,
    },
  ]).onConflictDoNothing().returning({ id: schema.courses.id, slug: schema.courses.slug });

  // ── 9. Course sections & lessons ───────────────────────────────────────
  console.log('\n📖 Seeding course content...');

  const excelCourseId = courseRows.find(c => c.slug === 'advanced-excel-accountants')?.id;
  if (excelCourseId) {
    const [section1] = await db.insert(schema.courseSections).values([
      { courseId: excelCourseId, title: 'Getting Started', position: 1 },
    ]).returning({ id: schema.courseSections.id });

    if (section1) {
      await db.insert(schema.courseLessons).values([
        { sectionId: section1.id, title: 'Course Overview', position: 1, durationMinutes: 5, isFree: true },
        { sectionId: section1.id, title: 'Setting Up Your Workbook', position: 2, durationMinutes: 12 },
        { sectionId: section1.id, title: 'Essential Keyboard Shortcuts', position: 3, durationMinutes: 8, isFree: true },
      ]);
    }

    const [section2] = await db.insert(schema.courseSections).values([
      { courseId: excelCourseId, title: 'Lookup Functions', position: 2 },
    ]).returning({ id: schema.courseSections.id });

    if (section2) {
      await db.insert(schema.courseLessons).values([
        { sectionId: section2.id, title: 'VLOOKUP Deep Dive', position: 1, durationMinutes: 20 },
        { sectionId: section2.id, title: 'INDEX & MATCH', position: 2, durationMinutes: 25 },
        { sectionId: section2.id, title: 'XLOOKUP (Excel 365)', position: 3, durationMinutes: 15 },
      ]);
    }
  }

  // ── 10. Article categories ─────────────────────────────────────────────
  console.log('\n📰 Seeding article categories...');

  const articleCategoryRows = await db.insert(schema.articleCategories).values([
    { name: 'Industry News', slug: 'industry-news', colourHex: '#0D1B3E' },
    { name: 'Career Advice', slug: 'career-advice', colourHex: '#1E6B3C' },
    { name: 'Tax Updates', slug: 'tax-updates', colourHex: '#8B1A1A' },
    { name: 'CPD & Training', slug: 'cpd-training', colourHex: '#B45309' },
    { name: 'Technology', slug: 'technology', colourHex: '#1A56B0' },
  ]).onConflictDoNothing().returning({ id: schema.articleCategories.id, slug: schema.articleCategories.slug });

  const articleCategoryMap: Record<string, string> = {};
  for (const row of articleCategoryRows) {
    articleCategoryMap[row.slug] = row.id;
  }
  if (Object.keys(articleCategoryMap).length === 0) {
    const existing = await db.select().from(schema.articleCategories);
    for (const row of existing) articleCategoryMap[row.slug] = row.id;
  }

  // ── 11. Articles ────────────────────────────────────────────────────────
  console.log('\n✍️  Seeding articles...');

  await db.insert(schema.articles).values([
    {
      authorId: adminId,
      title: 'IR35 Changes: What Contractors Need to Know in 2025',
      slug: 'ir35-changes-contractors-2025',
      excerpt: 'The IR35 rules continue to evolve. Here is everything accounting contractors and their clients need to know heading into 2025.',
      content: `<h2>What is IR35?</h2><p>IR35 is UK tax legislation designed to combat tax avoidance by workers supplying their services to clients via an intermediary, such as a limited company, but who would be an employee if the intermediary was not used.</p><h2>Key changes in 2025</h2><p>HMRC has updated its Check Employment Status for Tax (CEST) tool and clarified guidance on supervision, direction, and control tests. Contractors should review their contracts and working practices against the latest guidance.</p><h2>What you should do now</h2><ul><li>Review all existing contracts against HMRC's updated CEST tool</li><li>Ensure your client has conducted a proper Status Determination Statement (SDS)</li><li>Consider professional indemnity insurance if you advise clients on IR35 status</li></ul>`,
      categoryId: articleCategoryMap['tax-updates'],
      status: 'published',
      publishedAt: new Date('2025-01-15'),
      seoTitle: 'IR35 2025: A Complete Guide for Contractors | BUKZ Insight',
      seoDescription: 'Everything accounting contractors and engagers need to know about IR35 changes in 2025.',
      viewCount: 0,
    },
    {
      authorId: adminId,
      title: 'Top 10 Accounting Software Tools for Finance Teams in 2025',
      slug: 'top-accounting-software-2025',
      excerpt: 'From Xero to NetSuite, we rank the leading cloud accounting platforms helping finance teams work smarter.',
      content: `<h2>How we evaluated</h2><p>We assessed each platform on ease of use, integration ecosystem, reporting capabilities, support, and value for money across SME and enterprise tiers.</p><h2>Our top picks</h2><ol><li><strong>Xero</strong> — Best all-rounder for SMEs. Excellent bank feeds and a vast app ecosystem.</li><li><strong>QuickBooks Online</strong> — Strong payroll integration and intuitive UI.</li><li><strong>Sage Intacct</strong> — Best for mid-market companies with complex multi-entity reporting needs.</li><li><strong>NetSuite</strong> — Enterprise favourite with deep ERP functionality.</li><li><strong>FreeAgent</strong> — Ideal for freelancers and micro-businesses.</li></ol><h2>Our recommendation</h2><p>For most growing businesses in the UK, Xero remains the clear choice. Its open API and ecosystem of add-ons make it highly extensible as your needs grow.</p>`,
      categoryId: articleCategoryMap['technology'],
      status: 'published',
      publishedAt: new Date('2025-02-01'),
      seoTitle: 'Best Accounting Software 2025 | BUKZ Insight',
      seoDescription: 'Our ranked list of the best cloud accounting software for UK finance teams in 2025.',
      viewCount: 0,
    },
    {
      authorId: adminId,
      title: '5 Steps to Ace Your Next Accounting Interview',
      slug: '5-steps-accounting-interview',
      excerpt: 'Landing an interview is the hard part. Here is how to convert it into an offer with confidence.',
      content: `<h2>Preparation is everything</h2><p>Research the company's financial performance using Companies House filings. Understanding their revenue model, recent results, and any known challenges shows genuine interest and commercial awareness.</p><h2>Technical preparation</h2><p>Brush up on double-entry bookkeeping fundamentals, and be ready for scenario questions about accruals, prepayments, and month-end processes. For senior roles, expect questions on consolidation and deferred tax.</p><h2>Behavioural questions</h2><p>Use the STAR method (Situation, Task, Action, Result) for competency questions. Have 3-4 strong examples prepared covering problem solving, stakeholder management, and meeting deadlines under pressure.</p>`,
      categoryId: articleCategoryMap['career-advice'],
      status: 'published',
      publishedAt: new Date('2025-02-20'),
      seoTitle: 'How to Ace an Accounting Interview | BUKZ Insight',
      seoDescription: 'Proven tips to help accountants and finance professionals succeed in their next job interview.',
      viewCount: 0,
    },
  ]).onConflictDoNothing();

  // ── 12. Experts ─────────────────────────────────────────────────────────
  console.log('\n🧑‍🏫 Seeding experts...');

  await db.insert(schema.experts).values([
    {
      userId: instructorId,
      name: 'James Richardson',
      title: 'Chartered Accountant & Finance Coach',
      specialisations: ['Management Accounts', 'CIMA Study Support', 'Financial Modelling'],
      qualifications: ['ACA', 'CIMA'],
      bio: 'James is a qualified Chartered Accountant with 15 years of experience in financial reporting and management accounting across FTSE 250 companies and Big 4 advisory. He now coaches accountants looking to upskill or move into senior roles.',
      hourlyRateGbp: '120.00',
      calUsername: 'jrichardson-bukz',
      isVerified: true,
      isActive: true,
    },
  ]).onConflictDoNothing();

  // ── 13. Feature flags ───────────────────────────────────────────────────
  console.log('\n🚩 Seeding feature flags...');

  await db.insert(schema.featureFlags).values([
    { name: 'ai_job_matching', enabled: true, rolloutPercent: '100' },
    { name: 'expert_booking', enabled: true, rolloutPercent: '100' },
    { name: 'employer_subscriptions', enabled: true, rolloutPercent: '100' },
    { name: 'cpd_log', enabled: true, rolloutPercent: '100' },
  ]).onConflictDoNothing();

  console.log('\n✅ Seed complete!\n');
  console.log('  Admin account:');
  console.log('    Email:    admin@bukz.com');
  console.log('    Password: Admin1234!');
  console.log('\n  Test accounts:');
  console.log('    Employer:   employer@acmecorp.com  / Test1234!');
  console.log('    Instructor: instructor@bukz.com    / Test1234!');
  console.log('    Candidate:  candidate@example.com  / Test1234!');
  console.log('');

  await client.end();
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
