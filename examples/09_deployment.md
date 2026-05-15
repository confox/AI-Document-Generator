# Deployment & DevOps Plan
> Tells the AI how the app is hosted, built, and shipped

## Hosting Platform
Frontend: Vercel (automatic deploys from GitHub). Backend: Supabase Cloud (managed PostgreSQL + Auth + Realtime + Edge Functions). Email: Resend (transactional email for invites and verification). Assets (avatars): Supabase Storage.

## Environments
- development: localhost:5173 (Vite dev server), connects to a dedicated Supabase "dev" project
- staging: taskflow-staging.vercel.app — auto-deployed on every push to the `main` branch, uses a separate Supabase "staging" project
- production: taskflow.app — deployed manually by tagging a release (v*), uses the production Supabase project

## CI/CD Pipeline
GitHub Actions with two workflows:

ci.yml — runs on every pull request to main:
  1. Install dependencies (pnpm install --frozen-lockfile)
  2. Type check (pnpm tsc --noEmit)
  3. Run unit + component tests (pnpm test --run)
  4. Run Playwright E2E tests against the staging Supabase project
  5. Build the app (pnpm build) — fails the PR if build fails
  PRs cannot be merged if any step fails.

release.yml — runs on push of a v* tag:
  1. Run full test suite
  2. Build the production bundle
  3. Deploy to Vercel production (via Vercel CLI with --prod flag)
  4. Run Supabase migrations against the production database (supabase db push)

## Environment Variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- VITE_APP_URL
- SUPABASE_ACCESS_TOKEN
- VERCEL_TOKEN

## Monitoring & Alerting
Sentry (React SDK) for frontend error tracking — capture unhandled exceptions and React error boundaries. Sentry project alert: email on first occurrence of a new error. UptimeRobot — pings taskflow.app every 5 minutes, sends email + Slack alert on downtime. Supabase dashboard for database metrics (query performance, connection pool usage). Vercel Analytics for Core Web Vitals (no user PII collected).
