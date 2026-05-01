# BUKZ Accounting — Full-Stack Production Development Prompt

### Claude Code Master Prompt · April 2026

***

## HOW TO USE THIS PROMPT

1. Create project directly in current folder no need for a new folder
2. Run `claude` to open Claude Code
3. Run `/init` to generate a starter `CLAUDE.md`
4. Paste the **CLAUDE.md** block below into your `CLAUDE.md` file
5. Start a fresh session and paste the **INITIAL PROMPT** to begin the build
6. Use the **PHASE PROMPTS** for each subsequent build phase

***

## PART 1 — CLAUDE.md (paste into project root)

```markdown
# BUKZ Accounting Platform — Claude Code Rules

## Project
Multi-pillar accounting & finance platform. Three pillars: BUKZ Jobs (job board),
BUKZ Learn (LMS/courses), BUKZ Insight (editorial + tools). Stack: Next.js 14,
NestJS, PostgreSQL (Supabase), Algolia, Stripe, Auth0, AWS S3.

## Architecture rules
- Monorepo: apps/web (Next.js), apps/api (NestJS), packages/ui, packages/db, packages/config
- Each pillar is a NestJS module: JobsModule, LearnModule, InsightModule, AuthModule, PaymentsModule
- Shared DB schema in packages/db using Drizzle ORM
- All API routes prefixed: /api/v1/{pillar}/{resource}
- TypeScript strict mode throughout — no `any` types
- Zod for all request/response validation

## Code style
- No comments unless logic is non-obvious
- No console.log in production code — use the logger service
- Functional React components only — no class components
- Named exports from all modules, default export only for pages/routes
- Co-locate tests with source files: `component.test.tsx` next to `component.tsx`
- CSS: Tailwind utility classes only — no inline styles, no CSS modules

## What NOT to do
- Do not add features beyond what is explicitly asked
- Do not refactor working code while fixing a bug
- Do not add error handling for impossible scenarios
- Do not create abstractions for one-time operations
- Do not add docstrings to code you did not write or change
- Do not suggest "improvements" — implement what is asked

## Testing rules
- Every service method needs a unit test
- Every API endpoint needs an integration test
- Use Vitest for unit tests, Supertest for API integration tests
- Run `pnpm test` before marking any task complete

## Git rules
- Conventional commits: feat:, fix:, chore:, docs:, test:
- One commit per logical unit of work
- Never force push to main

## Environment
- Node.js 20+, pnpm 9+
- All secrets in .env.local (never committed)
- Use the existing .env.example as the template

## Verification
- After every feature: run `pnpm typecheck && pnpm lint && pnpm test`
- If any check fails, fix it before proceeding
- Do not mark tasks complete if tests fail
```

***

## PART 2 — INITIAL PROMPT (run in a fresh session)

```
You are building BUKZ Accounting — a production-ready, full-stack multi-pillar
platform for the UK accounting and finance sector. Read CLAUDE.md before doing
anything else.

## Project overview
BUKZ is a three-pillar platform modelled on the structural architecture of
Reed.co.uk but built for a specific vertical (accounting & finance) with a
modern stack and AI intelligence layer connecting all three pillars.

Pillars:
1. BUKZ Jobs — specialist job board for accounting & finance roles
2. BUKZ Learn — CPD-accredited course marketplace
3. BUKZ Insight — editorial hub with interactive tools and expert directory

## Tech stack (non-negotiable)
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: NestJS (Node.js), TypeScript, Drizzle ORM
- Database: PostgreSQL via Supabase (use Supabase JS client for auth + DB)
- Search: Algolia (InstantSearch for frontend, Algolia JS client for backend indexing)
- Auth: Supabase Auth (SSO across all pillars, RBAC: candidate/employer/instructor/admin)
- Payments: Stripe (subscriptions + one-time payments)
- File storage: AWS S3 + CloudFront
- Email: Resend + React Email templates
- Queue: BullMQ with Redis (Upstash for managed Redis)
- AI: OpenAI text-embedding-3-small + pgvector for job matching; Anthropic Claude API for skills gap analysis
- Deployment: Vercel (frontend), Railway (API + Redis); Docker Compose for local dev

## Open source integrations to use
Where a battle-tested open source solution exists, use it rather than building
from scratch. Required integrations:

- cal.com (self-hosted or API) — expert consultation booking in BUKZ Insight
- meilisearch — fallback search if Algolia budget is exceeded (same API surface)
- react-hook-form + zod — all forms frontend
- tiptap — rich text editor for job descriptions and course content
- uploadthing — file uploads (CVs, course materials, profile images)
- next-auth v5 — session management layer over Supabase Auth
- @tanstack/react-query — all server state, no direct fetch calls in components
- recharts — salary benchmarker and analytics dashboard charts
- react-email — all transactional email templates
- bull-board — BullMQ job queue dashboard (admin only)
- stripe-node + @stripe/stripe-js — payments
- @algolia/client-search — search indexing
- sentry/nextjs + sentry/node — error monitoring both sides
- posthog-js — product analytics and feature flags
- zod + drizzle-zod — schema validation synced to DB types

## Phase 1 task — scaffold the monorepo

Do the following in order. Use TodoWrite to track progress.

### Step 1 — Monorepo setup
Create a pnpm workspace monorepo with this structure:

```

bukz-platform/
├── apps/
│   ├── web/          # Next.js 14 App Router
│   └── api/          # NestJS
├── packages/
│   ├── ui/           # Shared React component library (shadcn/ui base)
│   ├── db/           # Drizzle ORM schema + migrations
│   ├── config/       # Shared ESLint, TypeScript, Tailwind configs
│   └── emails/       # React Email templates
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
└── CLAUDE.md

```

Use Turborepo for build orchestration. Configure turbo.json with pipelines:
build, dev, test, typecheck, lint.

### Step 2 — Database schema (packages/db)
Using Drizzle ORM with PostgreSQL, create the complete schema. Tables required:

AUTH & USERS
- users (id, email, name, avatar_url, role: enum[candidate,employer,instructor,admin], created_at)
- profiles (user_id FK, bio, location, phone, linkedin_url, website_url)

JOBS PILLAR
- job_categories (id, name, slug, parent_id nullable)
- job_listings (id, employer_id FK, title, description [text], category_id FK,
  location, salary_min, salary_max, salary_currency default GBP,
  job_type: enum[full_time,part_time,contract,interim,graduate],
  experience_level: enum[entry,mid,senior,director,cffo],
  remote_policy: enum[office,hybrid,remote],
  qualifications: text[], software_skills: text[],
  status: enum[draft,active,expired,filled],
  expires_at, views_count default 0, applications_count default 0,
  featured boolean default false, created_at, updated_at)
- candidates (id, user_id FK, cv_url, cv_filename, headline, years_experience,
  current_salary, desired_salary, notice_period, qualifications: text[],
  software_skills: text[], open_to_work boolean, embedding vector(1536))
- job_applications (id, job_id FK, candidate_id FK,
  status: enum[submitted,viewed,shortlisted,rejected,offered],
  cover_letter text, created_at)
- saved_jobs (user_id FK, job_id FK, created_at)

LEARN PILLAR
- course_categories (id, name, slug, parent_id nullable)
- courses (id, instructor_id FK, title, slug, description, short_description,
  thumbnail_url, category_id FK, level: enum[beginner,intermediate,advanced],
  price_gbp numeric, cpd_hours numeric, status: enum[draft,published,archived],
  enrollments_count default 0, rating_avg numeric, rating_count default 0,
  created_at, updated_at)
- course_sections (id, course_id FK, title, position int)
- course_lessons (id, section_id FK, title, content text, video_url,
  duration_minutes int, position int, is_free boolean default false)
- enrollments (id, user_id FK, course_id FK, stripe_payment_intent_id,
  progress_percent default 0, completed_at nullable, created_at)
- lesson_progress (user_id FK, lesson_id FK, completed boolean, completed_at)
- course_certificates (id, user_id FK, course_id FK, issued_at, certificate_url)
- course_reviews (id, user_id FK, course_id FK, rating int, body text, created_at)
- cpd_log (id, user_id FK, course_id FK nullable, hours numeric,
  activity_description text, logged_at)

INSIGHT PILLAR
- article_categories (id, name, slug, colour_hex)
- articles (id, author_id FK, title, slug, excerpt, content text,
  category_id FK, status: enum[draft,published], featured_image_url,
  seo_title, seo_description, published_at, view_count default 0,
  created_at, updated_at)
- experts (id, user_id FK, name, title, specialisations: text[],
  qualifications: text[], bio, avatar_url, hourly_rate_gbp numeric,
  cal_username, is_verified boolean default false, is_active boolean default true)
- bookmarks (user_id FK, article_id FK, created_at)

SHARED
- notifications (id, user_id FK, type text, title, body, read boolean default false,
  link text nullable, created_at)
- payments (id, user_id FK, stripe_payment_intent_id, amount_pence int,
  currency default GBP, status, description, metadata jsonb, created_at)
- feature_flags (id, name, enabled boolean, rollout_percent int default 100)

Generate Drizzle migration files. Export all table types. Create drizzle-zod
insert/select schemas for every table. Add indexes on: all FK columns,
job_listings.status, job_listings.created_at, courses.status,
articles.published_at, candidates.embedding (ivfflat).

### Step 3 — NestJS API scaffold (apps/api)
Create the NestJS application with this module structure:

src/
├── main.ts                    # Bootstrap, Swagger, global pipes
├── app.module.ts
├── common/
│   ├── filters/               # Global exception filter
│   ├── guards/                # Auth guard (Supabase JWT verification)
│   ├── interceptors/          # Logging, transform response
│   ├── decorators/            # @CurrentUser(), @Roles(), @Public()
│   ├── pipes/                 # ZodValidationPipe
│   └── services/
│       ├── logger.service.ts  # Winston logger
│       └── storage.service.ts # AWS S3 wrapper
├── auth/                      # AuthModule — verify Supabase JWTs, sync users
├── jobs/                      # JobsModule — listings, applications, candidates
├── learn/                     # LearnModule — courses, enrollments, progress
├── insight/                   # InsightModule — articles, experts, tools
├── payments/                  # PaymentsModule — Stripe webhooks, subscriptions
├── search/                    # SearchModule — Algolia sync service
├── ai/                        # AiModule — embeddings, matching, skills gap
├── notifications/             # NotificationsModule — email + in-app
└── admin/                     # AdminModule — platform management

Configure:
- Global ZodValidationPipe
- Global exception filter returning { error, message, statusCode }
- Swagger at /api/docs (disabled in production)
- CORS for web app domain
- Helmet for security headers
- Rate limiting: 100 req/min per IP, 1000 req/min per authenticated user
- BullMQ queues: email, search-sync, ai-embedding, notifications
- Drizzle connected to Supabase PostgreSQL connection string
- Sentry error tracking

### Step 4 — Next.js app scaffold (apps/web)
Create the Next.js 14 App Router application:

app/
├── (marketing)/               # Public marketing pages
│   ├── page.tsx               # Homepage — hero, three pillar cards, stats
│   ├── about/
│   └── pricing/
├── (jobs)/                    # BUKZ Jobs pillar
│   ├── jobs/
│   │   ├── page.tsx           # Job search — Algolia InstantSearch
│   │   └── [slug]/
│   │       └── page.tsx       # Job detail
│   ├── employers/
│   │   ├── dashboard/         # Employer portal (protected)
│   │   ├── post-job/          # Job posting flow
│   │   └── applicants/
│   └── candidates/
│       └── profile/           # Candidate profile (protected)
├── (learn)/                   # BUKZ Learn pillar
│   ├── learn/
│   │   ├── page.tsx           # Course catalogue
│   │   └── [slug]/
│   │       └── page.tsx       # Course detail + enrol
│   └── dashboard/
│       └── learn/             # My courses, progress, certificates (protected)
├── (insight)/                 # BUKZ Insight pillar
│   ├── insight/
│   │   ├── page.tsx           # Editorial hub
│   │   └── [slug]/
│   │       └── page.tsx       # Article
│   ├── tools/
│   │   ├── page.tsx           # Tools hub
│   │   ├── tax-calculator/
│   │   ├── ir35-checker/
│   │   └── salary-benchmarker/
│   └── experts/
│       ├── page.tsx           # Expert directory
│       └── [username]/
│           └── page.tsx       # Expert profile + cal.com booking embed
├── dashboard/                 # Unified user dashboard (protected)
│   └── page.tsx               # Jobs activity + courses progress + saved content
├── auth/
│   ├── login/
│   ├── register/
│   └── callback/              # Supabase auth callback
├── admin/                     # Admin portal (admin role only)
└── api/                       # Next.js API routes (webhooks only)
    └── webhooks/
        └── stripe/

Configure:
- next.config.js with image domains, bundle analyser
- Tailwind with BUKZ brand tokens: primary #0D1B3E, accent #C9A84C
- shadcn/ui initialised with components: button, card, input, select, badge,
  avatar, tabs, dialog, dropdown-menu, sheet, toast, skeleton, separator
- React Query provider in root layout
- Sentry browser client
- PostHog provider
- Middleware for auth protection on dashboard/* and employer/* routes

### Step 5 — Docker Compose local dev
Create docker-compose.yml with services:
- postgres (postgres:16-alpine) — port 5432
- redis (redis:7-alpine) — port 6379
- Create .env.example with all required environment variables documented

Provide pnpm commands in root package.json:
- dev: turbo dev (runs web + api concurrently)
- build: turbo build
- db:migrate: run drizzle migrations
- db:studio: open drizzle-kit studio
- test: turbo test
- typecheck: turbo typecheck

After completing all five steps, run:
pnpm typecheck && pnpm lint

Fix all errors. Then report exactly what was built, what files were created,
and what the next prompt should target.
```

***

## PART 3 — PHASE PROMPTS (run in sequence after Phase 1)

***

### Phase 2 — Authentication + Shared Identity Layer

```
Read CLAUDE.md. Phase 1 scaffold is complete.

Build the complete authentication and shared identity layer.

## AuthModule (apps/api/src/auth/)
- SupabaseAuthGuard: verify JWT from Authorization header using Supabase Admin SDK
- Sync Supabase auth.users to our public.users table on first login (upsert)
- @CurrentUser() decorator returns typed User from request
- @Roles(...roles) decorator + RolesGuard for RBAC
- @Public() decorator to bypass auth on public endpoints
- POST /api/v1/auth/sync — called after Supabase login to sync profile
- GET /api/v1/auth/me — returns current user with full profile

## Auth pages (apps/web)
Use Supabase SSR client (@supabase/ssr package).

- /auth/login — email+password + Google OAuth button
  - Use react-hook-form + zod validation
  - Show loading state during submission
  - Redirect to /dashboard on success, or to ?redirectTo param
- /auth/register — email+password with role selection (candidate / employer / instructor)
  - After register: redirect to onboarding flow for their role
- /auth/callback — handle Supabase OAuth callback, exchange code for session
- Middleware (middleware.ts): protect /dashboard/*, /employers/*, /admin/*
  Check Supabase session cookie. Redirect to /auth/login if no session.
  Check role for /admin/* — redirect to /dashboard if not admin.

## Onboarding flows
- /onboarding/candidate — name, location, headline, qualifications (multi-select),
  software skills (multi-select: Xero, Sage, QuickBooks, IRIS, CCH, FreeAgent)
- /onboarding/employer — company name, company size, industry sector, website
- /onboarding/instructor — professional bio, qualifications, LinkedIn

Each step saves to profiles table via API. Show progress indicator.
On completion, redirect to pillar homepage relevant to role.

## Unified header (packages/ui/src/components/nav/)
Shared Header component used across all three pillars.
- Logo (BUKZ) left — links to homepage
- Pillar nav centre: Jobs | Learn | Insight
- Right: if logged out: Log in + Get started buttons
          if logged in: notification bell (unread count badge) + user avatar dropdown
            Dropdown: Dashboard, My Jobs / My Courses (contextual by role), Settings, Sign out
- Mobile: hamburger → slide-out sheet with same links
- Sticky on scroll, backdrop-blur background

## Notifications
- GET /api/v1/notifications — paginated, unread first
- PATCH /api/v1/notifications/:id/read
- PATCH /api/v1/notifications/read-all
- Frontend: bell icon polling every 60s (React Query refetchInterval)
  Dropdown shows last 10 notifications with timestamp
  Mark individual or all as read

Run: pnpm typecheck && pnpm lint && pnpm test
Report what was built and confirm all tests pass.
```

***

### Phase 3 — BUKZ Jobs Pillar

```
Read CLAUDE.md. Auth layer is complete.

Build the BUKZ Jobs pillar end to end.

## JobsModule (apps/api/src/jobs/)

### Controllers + Services required:
JobListingsController — /api/v1/jobs/listings
- GET / — paginated list, filters: category, location, job_type, experience_level,
  remote_policy, salary_min, salary_max, featured_first
  Public endpoint. Increment view_count on GET /:slug
- GET /:slug — single listing detail (public)
- POST / — create listing (employer role only)
  Validate with Zod. Queue Algolia sync job after create.
- PATCH /:id — update listing (employer who owns it)
- DELETE /:id — soft delete, set status=expired
- POST /:id/feature — mark as featured (admin only)

JobApplicationsController — /api/v1/jobs/applications
- POST / — apply to a job (candidate role)
  body: { job_id, cover_letter }
  Check candidate has CV uploaded. Prevent duplicate applications.
  Queue email notification to employer.
  Increment applications_count on job listing.
- GET /my — candidate's applications with job details (candidate role)
- GET /received — employer's received applications, filterable by status (employer role)
- PATCH /:id/status — update application status (employer role)
  Queue email notification to candidate on status change.

CandidatesController — /api/v1/jobs/candidates
- GET /me — current candidate profile (candidate role)
- PUT /me — update candidate profile
- POST /me/cv — upload CV (multipart, max 5MB, PDF only)
  Use uploadthing or direct S3 presigned URL
  Extract text via Eden AI CV parsing, store structured data
  Queue AI embedding generation job

EmployersController — /api/v1/jobs/employers
- GET /me — employer profile
- PUT /me — update employer profile
- GET /me/listings — employer's listings with stats
- GET /me/stats — total listings, total applications, views this month

SalaryController — /api/v1/jobs/salary
- GET /benchmark — query params: role, location, experience_level
  Returns: percentile_25, median, percentile_75 from job_listings salary data

## Algolia sync (apps/api/src/search/)
SearchSyncService:
- syncJobListing(listing): index to 'bukz_jobs' Algolia index
  Attributes: title, description, category, location, job_type,
  salary_min, salary_max, remote_policy, qualifications, software_skills,
  employer_name, featured, created_at
- deleteJobListing(id): remove from index
- Called via BullMQ 'search-sync' queue after create/update/delete

## AI embedding (apps/api/src/ai/)
AiService:
- generateCandidateEmbedding(candidateId):
  Build text from: headline + qualifications + software_skills + CV extracted text
  Call OpenAI text-embedding-3-small
  Store 1536-dim vector in candidates.embedding (pgvector)
- matchJobsForCandidate(candidateId, limit=10):
  SELECT jobs ORDER BY embedding <=> candidate.embedding (cosine distance)
  Returns ranked job listings

## Jobs frontend (apps/web/app/(jobs)/)

### /jobs/ — Job search page
- Algolia InstantSearch with SearchBox, RefinementList, RangeInput, Hits
- Filters panel (desktop sidebar, mobile drawer):
  Category (RefinementList), Job type (RefinementList),
  Experience level (RefinementList), Remote policy (ToggleRefinement),
  Salary range (RangeInput), Location (SearchBox for location field)
- Job card component: title, employer, location, salary range, job_type badge,
  remote badge, posted_at relative time, save button (heart icon)
- Pagination (InfiniteHits)
- URL state sync (routing: true in InstantSearch config)
- Empty state with suggested searches

### /jobs/[slug] — Job detail page
- Server component — fetch from API
- Full job description (rendered markdown from tiptap)
- Employer card with logo
- Salary, location, job type, remote policy chips
- Apply button (opens modal if logged in as candidate, else redirects to register)
- Apply modal: cover letter textarea (optional) + CV confirmation + Submit
- Similar jobs (from AI matching endpoint)
- Social share buttons

### /employers/post-job — Multi-step job posting (employer only)
Step 1: Job details — title, category, job_type, experience_level
Step 2: Description — Tiptap rich text editor with formatting toolbar
Step 3: Requirements — qualifications checkboxes, software skills checkboxes,
        salary range (min/max), location, remote policy
Step 4: Package selection — Stripe payment (Single £199, 3-Pack £499)
Step 5: Preview + publish

Use react-hook-form across all steps with shared form state (useFormContext).
Zod schema per step. Show step progress indicator.
Stripe Checkout for payment step.

### /employers/dashboard — Employer portal (protected)
- Stats cards: Active listings, Total applications, Views this month
- Listings table: title, status badge, applications count, views, expires_at,
  action buttons (edit, pause, boost)
- Applications tab: received applications with candidate name, applied_at,
  status select dropdown (update inline)
- recharts: Applications over time (last 30 days line chart)

Run: pnpm typecheck && pnpm lint && pnpm test
Report what was built, any open issues, and confirm test coverage.
```

***

### Phase 4 — BUKZ Learn Pillar

```
Read CLAUDE.md. Jobs pillar is complete.

Build the BUKZ Learn pillar end to end.

## LearnModule (apps/api/src/learn/)

CoursesController — /api/v1/learn/courses
- GET / — paginated, filters: category, level, price_max, cpd_hours_min
  Public. Include instructor name, rating_avg, enrollments_count.
- GET /:slug — course detail with sections, lessons (public lessons only if not enrolled)
  Check enrollment status if user is authenticated.
- POST / — create course (instructor role). Status starts as draft.
- PATCH /:id — update course (owning instructor only)
- POST /:id/publish — set status=published (instructor, must have 1+ published lesson)
- GET /:id/analytics — enrollments over time, completion rate (owning instructor)

EnrollmentsController — /api/v1/learn/enrollments
- POST / — enrol in course
  body: { course_id, stripe_payment_intent_id }
  Verify payment intent succeeded with Stripe. Create enrollment record.
  Increment enrollments_count. Queue welcome email. Queue Algolia sync.
- GET /my — user's enrolled courses with progress
- GET /:id — single enrollment with full lesson progress

ProgressController — /api/v1/learn/progress
- POST /lesson — mark lesson complete
  body: { lesson_id }
  Upsert lesson_progress. Recalculate enrollment progress_percent.
  If 100%: set completed_at, generate certificate, queue email.
- GET /course/:course_id — full progress for a course

CertificatesController — /api/v1/learn/certificates
- GET /my — user's certificates
- GET /:id/download — generate PDF certificate (use pdf-lib or puppeteer)
  Include: BUKZ logo, candidate name, course name, CPD hours, issue date, UUID
- GET /:id/verify — public endpoint to verify certificate by UUID

CpdController — /api/v1/learn/cpd
- GET /my — CPD log with totals by year
- POST /manual — log manual CPD entry (non-course activity)
- GET /my/summary — total hours this year vs ICAEW/ACCA/CIMA requirements

ReviewsController — /api/v1/learn/reviews
- POST / — submit review (enrolled and completed users only)
  Recalculate course rating_avg after insert.
- GET /course/:course_id — paginated reviews

## Learn frontend (apps/web/app/(learn)/)

### /learn/ — Course catalogue
- Algolia InstantSearch on 'bukz_learn' index
- Filter panel: Category, Level, CPD hours (range), Price range, Rating
- Course card: thumbnail, title, instructor, rating stars, CPD hours badge,
  price, enrollments count, level badge
- Sort: Recommended, Newest, Highest rated, Most enrolled

### /learn/[slug] — Course detail
- Server component. Check enrollment (server-side via cookie session).
- Hero: thumbnail, title, instructor, rating, enrollments count, price, Enrol CTA
- Tabs: Overview | Curriculum | Instructor | Reviews
- Curriculum: sections accordion with lessons list
  Free lessons have a play button. Paid lessons show lock icon if not enrolled.
- Enrol CTA: if enrolled → Go to course. If not → Stripe Checkout.
- CPD hours badge with "Recognised CPD" text
- Related courses (same category, Algolia recommend)

### /dashboard/learn — My learning dashboard (protected)
- In Progress courses: course card with progress bar
- Completed courses: course card with "View Certificate" button
- CPD log: total hours this year, chart by month (recharts bar chart),
  breakdown by course, manual entry button
- Certificates grid: downloadable + shareable to LinkedIn

### Instructor portal — /instructors/dashboard (protected, instructor role)
- My courses table: title, status badge, enrollments, revenue (£), rating
- Create/edit course form with Tiptap editor for description
- Section + lesson builder: drag to reorder (use @dnd-kit/sortable)
- Lesson editor: title, content (Tiptap), video URL, duration, is_free toggle
- Publish/unpublish toggle with confirmation dialog
- Revenue chart: enrollments over time (recharts)

Run: pnpm typecheck && pnpm lint && pnpm test
```

***

### Phase 5 — BUKZ Insight Pillar + AI Intelligence Layer

```
Read CLAUDE.md. Learn pillar is complete.

Build the BUKZ Insight pillar and the AI cross-pillar intelligence layer.

## InsightModule (apps/api/src/insight/)

ArticlesController — /api/v1/insight/articles
- GET / — paginated, filter by category_id, search (full text), featured first
- GET /:slug — article detail, increment view_count
- POST / — create article (admin role, Tiptap JSON content)
- PATCH /:id — update article
- POST /:id/publish — set status=published, set published_at=now()

ExpertsController — /api/v1/insight/experts
- GET / — active experts, filterable by specialisation
- GET /:username — expert profile detail
  Include cal.com booking embed URL: https://cal.com/{username}
- POST / — create expert profile (admin role)
- PATCH /:id — update expert (admin or owning user)

ToolsController — /api/v1/insight/tools
- POST /tax-calculator
  body: { annual_income: number, pension_contribution?: number }
  Returns: { gross_income, personal_allowance: 12570, taxable_income,
    basic_rate_tax, higher_rate_tax, additional_rate_tax, total_tax,
    national_insurance, take_home_pay, effective_rate }
  Apply 2025/26 UK tax bands: 0% to £12,570, 20% to £50,270, 40% to £125,140, 45% above
  NI: 8% on £12,570–£50,270, 2% above

- POST /ir35-checker
  body: { answers: Record<string, boolean> } (15 IR35 indicator questions)
  Returns: { risk_level: 'inside'|'borderline'|'outside', score: number,
    reasoning: string[], recommendations: string[] }

- GET /salary-benchmark
  query: { title: string, location: string, experience_level: string }
  Query job_listings table for matching roles, return salary percentiles

## AI intelligence layer (apps/api/src/ai/)

SkillsGapService:
- analyseSkillsGap(userId):
  1. Get user's qualifications + software_skills from candidates table
  2. Query top 50 active job listings in user's preferred categories
  3. Extract required qualifications + skills frequency from listings
  4. Call Claude API (claude-sonnet-4-6 model):
     System: "You are a career advisor for UK accounting professionals."
     User: "Based on this candidate profile: {profile}
            And these top job market requirements: {market_data}
            Identify: 1) Skills the candidate has that are in demand
            2) Skills gaps — what they're missing vs market demand
            3) Recommended courses from this list: {available_courses}
            4) Estimated salary uplift from closing each gap
            Return as JSON: { strengths, gaps, recommendations, salary_impact }"
  5. Return structured JSON. Cache result in Redis for 24 hours.

RecommendationsService:
- getJobRecommendations(userId, limit=6):
  If candidate has embedding: use pgvector cosine similarity
  Else: filter by user's qualifications and category preferences
  
- getCourseRecommendations(userId, limit=6):
  Based on: jobs applied for (extract required skills), skills gap analysis,
  browsing history (PostHog), completed courses (exclude already enrolled)
  
- getArticleRecommendations(userId, limit=4):
  Based on: role (candidate/employer), bookmarked articles categories,
  recently viewed articles

## Insight frontend (apps/web/app/(insight)/)

### /insight/ — Editorial hub
- Featured article hero (full-width, latest featured=true article)
- Category tabs: Tax & HMRC | VAT | Payroll | MTD | Career Advice | Software
- Each tab: Algolia InstantSearch filtered grid of articles
- Sidebar: Popular articles, Expert spotlight card, Newsletter signup (Resend list)

### /insight/[slug] — Article page
- Server component for SEO — full SSR
- Article header: title, author avatar, published_at, category badge, read time
- Content: render Tiptap JSON to HTML with Tailwind prose styles
- Sidebar: author bio card, related articles, expert CTA
- Social share: LinkedIn, Twitter/X, copy link
- Bookmark button (authenticated users)

### /tools/ — Tools hub
Three tool components, each in its own route:

/tools/tax-calculator
- React Hook Form: annual income (number input), pension contribution (optional)
- POST to /api/v1/insight/tools/tax-calculator
- Results: breakdown table (income, tax-free allowance, taxable income,
  income tax, NI, total deductions, take-home pay)
- Monthly/weekly toggle for results
- recharts donut: take-home vs tax vs NI

/tools/ir35-checker
- 15-question form, each Yes/No radio
- Questions cover: substitution rights, control, MOO, equipment, financial risk,
  integration, exclusivity, length of engagement, payment method, holidays/sick pay
- POST to API → show risk level with colour (green/amber/red)
- Show reasoning list and recommendations
- CTA: Book an expert consultation

/tools/salary-benchmarker
- Inputs: job title (text), location (select: London, Manchester, etc.),
  experience level (select)
- GET from API → show bar chart (recharts): Your estimate vs market percentiles
- Show: Below market / At market / Above market label

### /experts/ — Expert directory
- Grid of expert cards: avatar, name, title, specialisations chips,
  qualifications, hourly rate, Book button
- Filter by specialisation
- /experts/[username] — expert profile
  Full bio, qualifications, specialisations
  Embedded cal.com booking widget: <Cal calLink="{username}" />
  Use @calcom/embed-react package

## Unified dashboard (apps/web/app/dashboard/)
For all authenticated users. Shows cross-pillar activity:
- Jobs section: recent applications with status, AI job matches (6 cards)
- Learn section: in-progress courses with progress bars
- Insight section: saved articles, skills gap summary card
- Skills gap CTA: "See your personalised skills analysis" → triggers AI analysis

Run: pnpm typecheck && pnpm lint && pnpm test
```

***

### Phase 6 — Payments, Email, Admin + Production Hardening

```
Read CLAUDE.md. All three pillars are complete.

Build the payments system, email layer, admin panel, and harden for production.

## PaymentsModule (apps/api/src/payments/)

StripeService:
- createJobPostingCheckout(employerId, packageType: 'single'|'triple'|'monthly'):
  Create Stripe Checkout Session with line items and metadata
  success_url: /employers/dashboard?payment=success
  cancel_url: /employers/post-job?step=4

- createCourseCheckout(userId, courseId):
  Create Checkout Session for course purchase
  On success: call EnrollmentsService.createEnrollment()

- createSubscription(userId, planId):
  Stripe subscription for employer monthly unlimited plan

WebhooksController — POST /api/webhooks/stripe (Next.js API route, not NestJS)
- Verify Stripe-Signature header (use raw body)
- Handle events:
  checkout.session.completed → activate job listing or enroll in course
  invoice.payment_succeeded → extend subscription
  invoice.payment_failed → notify user, suspend listing
  customer.subscription.deleted → downgrade to free tier

## Emails (packages/emails/)
Using React Email + Resend. Create templates:

- WelcomeEmail(name, role) — sent on registration
- ApplicationReceivedEmail(employerName, jobTitle, candidateName) — to employer
- ApplicationStatusEmail(candidateName, jobTitle, status, message?) — to candidate
- CourseEnrolmentEmail(name, courseTitle, cpdHours, instructorName) — to learner
- CourseCertificateEmail(name, courseTitle, certificateUrl) — on completion
- JobAlertEmail(name, jobs[]) — weekly digest for candidates
- ExpertBookingEmail(name, expertName, date, calLink) — booking confirmation

NotificationsService: queue email via BullMQ 'email' queue.
EmailWorker: processes queue, sends via Resend SDK.

## Admin panel (apps/web/app/admin/)
Role: admin only. Protected by middleware.

Pages:
- /admin — dashboard: total users, listings, enrollments, revenue (MTD)
- /admin/users — users table with role filter, ability to ban/change role
- /admin/jobs — all job listings with moderation actions (approve/reject/expire)
- /admin/courses — all courses with publish/unpublish
- /admin/articles — CMS for Insight articles (create/edit/publish)
- /admin/experts — manage expert directory
- /admin/payments — transaction log from payments table
- /admin/queues — embed bull-board UI at /admin/queues

Use shadcn/ui DataTable (TanStack Table) for all admin tables.

## Production hardening

### Security
- Add OWASP security headers via Helmet (NestJS) and next.config.js headers()
  Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy
- API rate limiting already configured in Phase 1 — verify it works
- Input sanitisation: DOMPurify on any HTML content before storage
- CSRF: Supabase handles this via SameSite cookies
- SQL injection: Drizzle ORM parameterised queries throughout (verify no raw SQL)
- File upload validation: check MIME type server-side (not just extension)

### Performance
- Add Redis caching in NestJS via cache-manager:
  Job listings list: TTL 60s
  Course catalogue: TTL 300s
  Article list: TTL 300s
  Salary benchmark: TTL 3600s
  AI skills gap: TTL 86400s (24hr)
- Next.js: add generateStaticParams for /jobs/[slug] and /learn/[slug] (ISR, revalidate 60)
- Add next/image throughout — replace all <img> tags
- Add loading.tsx skeleton screens for all pillar homepages and detail pages
- Add error.tsx for all route segments

### Monitoring
- Sentry: configure source maps upload in CI, set sample rates (10% transactions)
- PostHog: add page view tracking, custom events:
  job_viewed, job_applied, course_enrolled, course_completed, tool_used, article_read
- Add /api/health endpoint returning { status: 'ok', db: bool, redis: bool, timestamp }

### Deployment config
Create:
- Dockerfile for apps/api (multi-stage, Node Alpine)
- .github/workflows/ci.yml:
  On PR: install → typecheck → lint → test
  On merge to main: build → deploy to Railway (API) + Vercel (web)
- vercel.json for web app (no special config needed beyond defaults)
- railway.json or Procfile for API: web: node dist/main.js
- Add all required environment variables to .env.example with descriptions

### Final checks
Run in order:
1. pnpm typecheck — zero errors required
2. pnpm lint — zero warnings required  
3. pnpm test — all tests pass
4. pnpm build — both apps build successfully
5. docker-compose up — local stack boots cleanly

Report: final file/directory structure, test coverage summary, known limitations,
and recommended post-launch monitoring checklist.
```

***

## PART 4 — OPEN SOURCE PACKAGES REFERENCE

| Package                                   | Purpose                    | Pillar                 |
| ----------------------------------------- | -------------------------- | ---------------------- |
| `@supabase/supabase-js` + `@supabase/ssr` | Auth + DB client           | Shared                 |
| `drizzle-orm` + `drizzle-kit`             | ORM + migrations           | Shared                 |
| `drizzle-zod`                             | Schema → Zod validation    | Shared                 |
| `algoliasearch` + `react-instantsearch`   | Search                     | Jobs + Learn           |
| `stripe` + `@stripe/stripe-js`            | Payments                   | Shared                 |
| `@calcom/embed-react`                     | Expert booking             | Insight                |
| `@tiptap/react` + extensions              | Rich text editor           | Jobs + Learn + Insight |
| `uploadthing`                             | File uploads (CV, images)  | Jobs + Learn           |
| `react-hook-form` + `zod`                 | Form state + validation    | All                    |
| `@tanstack/react-query`                   | Server state               | All                    |
| `recharts`                                | Charts + data viz          | Jobs + Learn + Tools   |
| `@dnd-kit/sortable`                       | Drag-to-reorder lessons    | Learn                  |
| `react-email` + `resend`                  | Email templates + delivery | Shared                 |
| `bullmq` + `@bull-board/api`              | Job queue + UI             | API                    |
| `pdf-lib`                                 | Certificate PDF generation | Learn                  |
| `openai`                                  | Embeddings (job matching)  | AI                     |
| `@anthropic-ai/sdk`                       | Skills gap analysis        | AI                     |
| `@sentry/nextjs` + `@sentry/node`         | Error monitoring           | Shared                 |
| `posthog-js`                              | Product analytics          | Web                    |
| `@upstash/redis`                          | Managed Redis              | API                    |
| `helmet`                                  | Security headers           | API                    |
| `winston`                                 | Structured logging         | API                    |
| `@nestjs/throttler`                       | Rate limiting              | API                    |
| `@nestjs/cache-manager`                   | Redis caching              | API                    |

***

## PART 5 — ENVIRONMENT VARIABLES (.env.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
ALGOLIA_ADMIN_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-2
AWS_S3_BUCKET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@bukzaccounting.co.uk

# OpenAI
OPENAI_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Cal.com
CAL_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:3001
NODE_ENV=development
```

***

*BUKZ Accounting Platform — Claude Code Production Prompt v1.0 · April 2026*
*Six phases · Full-stack · TypeScript throughout · Production-ready*
