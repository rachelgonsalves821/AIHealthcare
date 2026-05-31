# 0001 — Stack Selection

**Date:** 2026-05-31  
**Status:** Accepted

## Context

We are building the Complex-Case Layer backend: a human-in-the-loop system for healthcare prior-authorization and denial management. The core constraint is that no clinical decision is ever finalized autonomously — a licensed clinician must sign off before any appeal is submitted.

## Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 24 LTS, TypeScript strict | Current LTS; strong ecosystem for healthcare integrations; strict TS catches data-model bugs early |
| Web framework | Express v5 | Mature, minimal footprint; async error propagation built-in in v5 |
| ORM | Prisma | Type-safe queries; built-in migration tooling; Supabase-compatible pooled/direct URL split |
| Database | Supabase PostgreSQL | Managed Postgres with RLS, encryption-at-rest, and HIPAA BAA availability |
| Auth | Clerk (`@clerk/express`) | Organization scoping out of the box; JWT middleware; role claims can be extended |
| Job queue | pg-boss | Postgres-native — no Redis dependency; durable; supports cron scheduling; idempotency keys |
| LLM | Anthropic Claude via `@anthropic-ai/sdk` | Configurable behind `LLMProvider` interface so the provider can be swapped; mock used in tests |
| Logging | pino + pino-http | Structured JSON; fast; supports child loggers for per-request context; PHI redaction hooks |
| Validation | Zod | Runtime schema enforcement for request bodies, env vars, and job payloads |
| Testing | Vitest | Fast, native ESM/TS support; compatible with mocking strategy |
| API docs | OpenAPI 3.1 + swagger-ui-express | Standard; served at /docs; generated from route definitions |
| Security | helmet + CORS allowlist + express-rate-limit | Defense-in-depth for HTTP headers, CORS, and brute-force mitigation |

## Tradeoffs Noted

- **Prisma vs. Drizzle**: Drizzle is lighter, but Prisma's migration workflow and type generation are more robust for a schema this complex.
- **pg-boss vs. BullMQ**: BullMQ requires Redis; pg-boss re-uses the existing Postgres, reducing operational surface.
- **Express vs. Fastify**: Fastify is faster, but Express v5 has the widest middleware ecosystem and the team is familiar with it.

## Compliance Note

Production deployment requires signed BAAs with Supabase and Anthropic before any real PHI is processed. See `docs/compliance.md`.
