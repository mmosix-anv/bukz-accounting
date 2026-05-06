# BUKZ Accounting Platform

Multi-pillar accounting & finance platform encompassing:
- **BUKZ Jobs:** Job board
- **BUKZ Learn:** LMS / Courses
- **BUKZ Insight:** Editorial & Tools

## Architecture

This project is a single Next.js 14 App Router application at the root directory. It uses `src/app/api/v1` for backend route handlers and shared packages under `packages/*` (`@bukz/db`, `@bukz/ui`, etc.).

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local Postgres & Redis)

## Local Setup

1. **Install dependencies:**
   ```bash
   corepack enable
   pnpm install
   ```

2. **Environment variables:**
   Copy `.env.example` to `.env.local` and populate the required keys.
   ```bash
   cp .env.example .env.local
   ```

3. **Start local database:**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations and seed the database:**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## Available Commands

- `pnpm dev` - Start the local development server.
- `pnpm build` - Build the application for production.
- `pnpm test` - Run the Vitest test suite.
- `pnpm lint` - Run ESLint.
- `pnpm typecheck` - Run TypeScript type checking.
- `pnpm db:studio` - Open Drizzle Studio to inspect the local database.

## Deployment

The application is deployed as a single unit on Vercel. 
The CI/CD pipeline runs on GitHub Actions and handles type checking, linting, testing, and automated deployment.

## Troubleshooting

- **Rate Limiting:** A basic in-memory rate limiter protects `/api/*` endpoints. 
- **Logs:** Use `import { logger } from '@/lib/logger'` for structured logging in production.
- **Errors:** Root layout crashes are caught by `src/app/global-error.tsx`.
