# 0004 — Criteria Refresh Job Design

**Date:** 2026-05-31  
**Status:** Stub (not implemented)

## Context

The `criteria.refresh` pg-boss job is scaffolded as a scheduled stub (runs daily at 06:00 UTC). It is the future home of automated payer-criteria change tracking.

## Planned Design

1. For each payer, fetch current criteria from their provider portal or a criteria database API.
2. Compare with the latest `PayerCriteria` version in the database.
3. If changes detected, create a new `PayerCriteria` version (never overwrite existing versions — they are immutable for audit purposes).
4. Set `supersededById` on the new record to point to the previous version.
5. Emit a notification/webhook for RCM staff review.

## Why Not Implemented Now

- Payer criteria APIs vary widely and require individual integration work per payer.
- No external payer API credentials are available in this scaffold.
- The data model and versioning logic are in place; only the fetch+diff logic is pending.

## TODO

- [ ] Implement per-payer criteria fetchers (web scraping or API)
- [ ] Add diff logic to detect substantive vs. formatting changes
- [ ] Wire notifications for manual review before new criteria go live
- [ ] Add `criteriaSource` field to `PayerCriteria` for provenance tracking
