# Compliance Scaffolding

> **Disclaimer**: This document describes the compliance-oriented design of the system. It is not a legal compliance certification. Production use with real patient data requires legal review, signed Business Associate Agreements, and completion of all items marked **[REQUIRED BEFORE GO-LIVE]**.

## PHI Minimization

- Patient-identifying fields are stored only in the `patients` table (`externalMrnHash`, `dateOfBirth`, `sex`).
- **Raw MRNs are never stored** — only a SHA-256 hash of the MRN is stored in `externalMrnHash`.
- The `cases` table holds a foreign key to `patients` but no patient demographics inline.
- Evidence packs and audit logs contain only IDs and clinical metadata — never patient names, MRNs, or contact information.

## Audit Logging

- Every read of the `patients` table must be accompanied by a `writeAuditLog` call with `action: 'patient.read'`.
- All writes (case creation, status transitions, appeal sign-off, submission) write to `audit_logs`.
- `audit_logs` is append-only: no UPDATE or DELETE paths exist in the repository layer.
- Audit log `metadata` (JSONB) must never contain PHI fields — this is validated by the PHI redaction logic.

## PHI Redaction in Logs

- `src/lib/logger.ts` implements `redactPhi()` which replaces known PHI field names with `[REDACTED]`.
- pino's `redact` option provides an additional serializer-level guard.
- Covered fields: `mrn`, `externalMrnHash`, `dateOfBirth`, `dob`, `ssn`, `address`, `phone`, `firstName`, `lastName`, `patientName`, `memberName`, `email`.
- A test in `src/lib/logger.test.ts` asserts that patient fields never appear in serialized log output.

## Secrets Management

- All secrets are loaded from environment variables only. No secrets are committed to the repository.
- `.env` files are listed in `.gitignore`.
- `.env.example` documents all required variables with placeholder values.
- In production, secrets should be managed via Google Cloud Secret Manager (for Cloud Run deployments) or equivalent.

## API Security

- **helmet**: sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.).
- **CORS**: allowlist driven by `ALLOWED_ORIGINS` environment variable. Defaults to `localhost:3000`.
- **Rate limiting**: 120 requests/minute per IP (configurable via `RATE_LIMIT_PER_MINUTE`).
- **Authentication**: all `/v1/` routes require valid Clerk JWTs. Organization scoping ensures tenants cannot access each other's data.
- **RBAC**: role-based access control guards sensitive operations (sign-off requires CLINICIAN, payer admin requires ADMIN, etc.).

## Clinician Sign-Off Gate

The most critical compliance control in this system:

- **Service layer**: `appealService.submitAppeal()` throws `SignOffRequiredError` (HTTP 422) if `clinicianSignoffUserId` or `signedOffAt` are null.
- **Database layer**: `appeals` table has a `CHECK` constraint:
  ```sql
  CONSTRAINT appeals_signoff_required_for_submission
    CHECK (
      status != 'SUBMITTED' OR
      (clinicianSignoffUserId IS NOT NULL AND "signedOffAt" IS NOT NULL)
    )
  ```
- **API layer**: `POST /v1/appeals/:id/submit` will return 422 if the service check fails; even if somehow bypassed, the DB constraint prevents the row from being written.
- Tests in `src/modules/appeals/appealService.test.ts` prove this constraint is enforced.

## Required Before Go-Live **[REQUIRED BEFORE GO-LIVE]**

| Item | Status |
|---|---|
| Signed BAA with Anthropic | Not signed — required for PHI in LLM prompts |
| Signed BAA with Supabase | Not signed — required for PHI in database |
| Supabase Row-Level Security (RLS) enabled | Must be configured per org |
| Supabase encryption-at-rest confirmed | Enabled by default on Supabase Pro+ |
| Google Cloud Run VPC connector (no public IP) | Must be configured for production |
| Google Cloud Secret Manager for all secrets | Replace env vars with Secret Manager refs |
| HIPAA-compliant logging destination | Logs must not be stored in non-BAA systems |
| Penetration test | Required before handling real PHI |
| Security review of Clerk JWT claims | Validate org scoping cannot be spoofed |
| Data retention policy implementation | Currently no auto-deletion of old records |
