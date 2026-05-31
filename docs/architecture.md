# Architecture Overview

## System Purpose

The Complex-Case Layer handles the high-complexity tail of prior-authorization and denial work — specifically peer-to-peer (P2P) reviews, complex appeals, and clinical documentation that submission-automation vendors cannot handle autonomously.

**Core constraint:** No clinical decision is ever finalized without a licensed clinician sign-off. This is enforced at the data model, service, and API layers.

## Data Flow

```
Vendor / EHR / RCM
       │
       ▼
POST /v1/ingest/webhook  ──► Case created (status=RECEIVED)
       │
       ▼
RCM Staff triages         ──► PATCH /v1/cases/:id → TRIAGED
       │
       ▼
POST /v1/cases/:id/evidence ──► pg-boss job: evidence.generate
       │                              │
       │                    Google Gemini (or Anthropic)
       │                    generates structured evidence
       │                    citing PayerCriteria versions
       │                              │
       │                    EvidencePack written ──► EVIDENCE_READY
       │
       ├──(optional P2P)──► POST /v1/cases/:id/p2p ──► P2P_SCHEDULED
       │                     PATCH /v1/p2p/:id (outcome)
       │
       ▼
POST /v1/cases/:id/appeal ──► pg-boss job: appeal.draft
       │                              │
       │                    LLM drafts appeal referencing
       │                    EvidencePack + PayerCriteria
       │                              │
       │                    Appeal written (AWAITING_SIGNOFF) ──► APPEAL_DRAFTED
       │
       ▼
POST /v1/appeals/:id/signoff ─► Clinician reviews and signs
       │                        (CLINICIAN role only)
       │                        Appeal → SIGNED
       │
       ▼
POST /v1/appeals/:id/submit ──► Validates sign-off (service + DB CHECK)
       │                        Appeal → SUBMITTED
       │                        Case → SUBMITTED
       │
       ▼
POST /v1/cases/:id/outcome ──► Resolution recorded
       │                       Case → RESOLVED
       │
       ▼
GET /v1/analytics/denials ──► Win-rate aggregations by payer + denial reason
```

## Module Boundaries

| Module | Responsibility |
|---|---|
| `cases/` | Case lifecycle, state machine, org-scoped CRUD |
| `payers/` | Payer registry, versioned criteria (immutable history) |
| `evidence/` | Evidence pack CRUD, job enqueue |
| `peertopeer/` | P2P scheduling, outcome recording |
| `appeals/` | Appeal CRUD, clinician sign-off gate, submission enforcement |
| `outcomes/` | Resolution logging |
| `analytics/` | Denial win-rate aggregations |
| `audit/` | Append-only audit log (no update/delete) |
| `ingest/` | Vendor webhook intake |

## Key Invariants

1. **Sign-off gate**: `appeals.status = 'SUBMITTED'` requires `clinicianSignoffUserId IS NOT NULL AND signedOffAt IS NOT NULL` (CHECK constraint in DB + service-layer guard).
2. **State machine**: Case transitions follow a strict DAG; invalid transitions are rejected with HTTP 400.
3. **Org scoping**: All queries include `orgId = req.auth.orgId`. Cross-tenant access is impossible.
4. **PHI isolation**: Patient demographics live only in `patients` table. All other tables reference only `patientId`.
5. **Audit completeness**: Every write and patient read produces an `audit_logs` entry.
6. **Append-only audit**: No UPDATE or DELETE paths exist in `auditRepository`.

## Infrastructure

```
Google Cloud Run (HTTP service)     Google Cloud Run (background)
├── src/server.ts (Express app)     └── src/worker.ts (pg-boss worker)
│   ├── Clerk JWT auth                  ├── evidence.generate
│   ├── v1 router                       ├── appeal.draft
│   └── /healthz, /readyz               └── criteria.refresh (cron)
│
└── Supabase PostgreSQL
    ├── App tables (cases, appeals, etc.)
    ├── pg-boss queue tables
    └── audit_logs (append-only)
```

## LLM Provider Configuration

Set `LLM_PROVIDER` env var to switch providers:

| Value | Provider | Notes |
|---|---|---|
| `google` | Google AI Studio (Gemini) | Default; see 0002 for HIPAA notes |
| `anthropic` | Anthropic Claude | Set `LLM_MODEL` to desired model |
| `mock` | Deterministic mock | Used in all tests |
