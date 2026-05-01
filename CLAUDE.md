# BUKZ Accounting Platform — Claude Code Rules

## Project
Multi-pillar accounting & finance platform. Three pillars: BUKZ Jobs (job board),
BUKZ Learn (LMS/courses), BUKZ Insight (editorial + tools). Stack: Next.js 14,
PostgreSQL (Supabase), Algolia, Stripe, AWS S3.

## Architecture rules
- Single Next.js app at root. Shared packages at packages/ui, packages/db, packages/config
- src/app — Next.js App Router pages and layouts
- src/app/api/v1 — Route Handlers (replace NestJS; one file per route group)
- src/lib/services — Pure TypeScript service functions (DB access, business logic)
- src/lib/db.ts — Drizzle singleton (postgres.js connection)
- src/lib/route-handler.ts — Auth helpers: getAuthUser(), ok(), err(), unauthorized()
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
- Use Vitest for all tests
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
