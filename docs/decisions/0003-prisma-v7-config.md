# 0003 — Prisma v7 Configuration Changes

**Date:** 2026-05-31  
**Status:** Accepted

## Context

Prisma v7 (released 2025) moved connection URL configuration from `schema.prisma` to `prisma.config.ts`. The `url` and `directUrl` properties in `datasource db {}` are no longer supported.

## Decision

- Created `prisma.config.ts` using `defineConfig` from `prisma/config`.
- Uses `@prisma/adapter-pg` with a `pg.Pool` for both app runtime and migrations.
- `DATABASE_URL` is used for the app pool; `DIRECT_URL` (if set) is used for migrations.
- Migration SQL is maintained manually in `prisma/migrations/` — Prisma 7 generates the client from schema but the migration needs to be applied separately.

## Impact

- `npm run db:migrate` requires a live Supabase connection with `DIRECT_URL` set.
- `npm run db:generate` works without a connection (reads schema only).
- `npm run db:seed` requires a live connection.
- For CI without a DB: run only `npm run db:generate` (generates TypeScript types from schema).
