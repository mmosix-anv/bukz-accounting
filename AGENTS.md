# BUKZ Accounting Platform — Codex Rules

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
