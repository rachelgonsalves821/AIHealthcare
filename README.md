# Complex-Case Layer — Backend

Healthcare prior-authorization and denial management backend. Handles peer-to-peer reviews, complex appeals, and clinical documentation with a mandatory clinician sign-off gate before any appeal can be submitted.

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/rachelgonsalves821/AIHealthcare.git
cd AIHealthcare
npm install

# 2. Set up environment
cp .env.example .env
# Fill in: DATABASE_URL, DIRECT_URL, CLERK_SECRET_KEY, GOOGLE_AI_API_KEY

# 3. Generate Prisma client (no DB needed)
npm run db:generate

# 4. Apply migrations (requires live Supabase connection)
npm run db:migrate

# 5. Seed synthetic data
npm run db:seed

# 6. Run tests
npm test

# 7. Start the API server
npm run dev

# 8. Start the job worker (separate terminal)
npm run worker
```

## Environment Variables

See [.env.example](.env.example) for all required variables. Key ones:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooled connection string |
| `DIRECT_URL` | Supabase direct connection (for migrations) |
| `CLERK_SECRET_KEY` | Clerk backend SDK key |
| `LLM_PROVIDER` | `google` (default), `anthropic`, or `mock` |
| `LLM_MODEL` | Model name — `gemini-2.0-flash` or `claude-opus-4-5` |
| `GOOGLE_AI_API_KEY` | Google AI Studio API key |
| `ALLOWED_ORIGINS` | CORS allowlist (comma-separated) |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start API server with hot reload |
| `npm run build` | TypeScript compile to `dist/` |
| `npm start` | Start compiled server |
| `npm run worker` | Start pg-boss job worker |
| `npm test` | Run all tests (mock LLM — no API keys needed) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run db:generate` | Generate Prisma client from schema |
| `npm run db:migrate` | Apply migrations (requires DB) |
| `npm run db:seed` | Load synthetic seed data (requires DB) |
| `npm run db:deploy` | Apply migrations in production (no prompts) |

## API

Full OpenAPI 3.1 spec at `openapi.yaml`. When running locally, Swagger UI is served at `http://localhost:8080/docs`.

### Key Endpoints

```
POST /v1/cases                          Create a case
GET  /v1/cases                          List cases (filter by status, payer, assignee)
PATCH /v1/cases/:id                     Transition case status (state machine enforced)
POST /v1/cases/:id/evidence             Enqueue evidence generation (LLM)
POST /v1/cases/:id/p2p                  Schedule peer-to-peer review
POST /v1/cases/:id/appeal               Enqueue appeal draft generation (LLM)
POST /v1/appeals/:id/signoff            Clinician sign-off (CLINICIAN role only)
POST /v1/appeals/:id/submit             Submit appeal (requires sign-off)
POST /v1/cases/:id/outcome              Record resolution
GET  /v1/analytics/denials              Win-rate analytics
POST /v1/ingest/webhook                 Vendor handoff intake
GET  /healthz                           Liveness probe
GET  /readyz                            Readiness probe
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for data-flow diagram and module overview.

## Compliance

See [docs/compliance.md](docs/compliance.md) for PHI handling, audit logging, and HIPAA scaffolding details.

**Critical constraint:** An appeal cannot transition to `SUBMITTED` without a recorded clinician sign-off. This is enforced at the service layer AND by a database `CHECK` constraint on the `appeals` table.

## Google Cloud Run Deployment

```bash
# Build and push container
docker build -t gcr.io/[PROJECT]/complex-case-backend .
docker push gcr.io/[PROJECT]/complex-case-backend

# Deploy API service
gcloud run deploy complex-case-api \
  --image gcr.io/[PROJECT]/complex-case-backend \
  --command node,dist/server.js \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,...

# Deploy worker service
gcloud run deploy complex-case-worker \
  --image gcr.io/[PROJECT]/complex-case-backend \
  --command node,dist/worker.js \
  --no-allow-unauthenticated
```

## Decision Log

| # | Topic |
|---|---|
| [0001](docs/decisions/0001-stack.md) | Tech stack rationale |
| [0002](docs/decisions/0002-google-ai-cloud-run.md) | Google AI Studio + Cloud Run |
| [0003](docs/decisions/0003-prisma-v7-config.md) | Prisma v7 config changes |
| [0004](docs/decisions/0004-criteria-refresh.md) | Criteria refresh job design |
