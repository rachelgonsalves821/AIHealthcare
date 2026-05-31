---
title: "ADR-0001: Frontend Technology Stack Selection"
date: "2026-05-31"
status: accepted
deciders: [engineering-team]
---

## Context

Crux requires a modern, type-safe frontend that supports role-based access control for three user types (RCM/UM Staff, Clinicians, Admins), complex case management workflows, real-time status updates, and analytics dashboards. The application must enforce a non-negotiable clinician sign-off gate before appeal submission.

## Decision

We selected the following technology stack:

- **React 18 + Vite**: Industry-standard SPA framework with fast HMR and build times
- **TypeScript strict mode**: Maximum type safety, prevents runtime errors
- **React Router v6**: Declarative routing with nested routes and lazy loading
- **Zustand**: Lightweight client state (UI/filter state) — simpler than Redux for our use case
- **TanStack Query (React Query)**: Server state management with caching, background refetching, and optimistic updates
- **Clerk React SDK**: Authentication with org-scoping and role guards from publicMetadata
- **React Hook Form + Zod**: Performant form handling with schema validation
- **Radix UI + Tailwind CSS**: Accessible headless UI primitives with utility-class styling
- **Axios**: HTTP client with interceptor support for Clerk token injection
- **Recharts**: Declarative chart library for analytics visualizations
- **Vitest + React Testing Library**: Fast unit/integration testing with jsdom

## Consequences

**Positive:**
- Strict TypeScript catches domain model errors at compile time
- TanStack Query eliminates boilerplate for loading/error/stale states
- Clerk handles auth complexity (JWTs, session management, org switching)
- Radix UI ensures accessibility without hand-rolling ARIA patterns
- Zustand's minimal API reduces state management complexity

**Negative:**
- Clerk introduces vendor lock-in for auth
- Radix UI primitives require styling effort (mitigated by Tailwind)
- TanStack Query has learning curve for new developers
