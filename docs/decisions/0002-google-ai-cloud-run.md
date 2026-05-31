# 0002 — Google AI Studio + Google Cloud Run

**Date:** 2026-05-31  
**Status:** Accepted

## Context

After initial stack selection (see 0001), the operator requested using Google AI Studio as the LLM provider and Google Cloud Run as the deployment platform.

## Decision

### LLM: Google AI Studio (Gemini)

- `src/llm/google.ts` implements `LLMProvider` using `@google/generative-ai` (official SDK).
- Default model: `gemini-2.0-flash` (set via `LLM_MODEL` env var).
- `LLM_PROVIDER=google` is the new default in `.env.example`.
- The Anthropic implementation (`src/llm/anthropic.ts`) is retained — providers are swappable via `LLM_PROVIDER` env var.

### Deployment: Google Cloud Run

- `Dockerfile` added for containerized deployment.
- Cloud Run is well-suited: stateless HTTP, pay-per-request, scales to zero.
- pg-boss worker (`src/worker.ts`) should run as a separate Cloud Run service (background services) or a Cloud Run Job.
- Supabase Postgres remains the database — fully compatible with Cloud Run.

## Tradeoffs

| Concern | Google Gemini | Anthropic Claude |
|---|---|---|
| BAA availability | Google Cloud HIPAA BAA covers Vertex AI (not AI Studio) | Anthropic offers BAA for API customers |
| Latency | Generally fast | Generally fast |
| Cost | Competitive | Competitive |

**HIPAA NOTE**: Google AI Studio (API key path) is NOT covered by Google's BAA. For production PHI workloads, use Vertex AI instead and configure `LLM_PROVIDER=vertex` (future implementation). AI Studio is acceptable for development and non-PHI workloads.

## Environment Variable Changes

```
LLM_PROVIDER=google           # was: anthropic
LLM_MODEL=gemini-2.0-flash    # update to latest Gemini model
GOOGLE_AI_API_KEY=...         # new: required for Google provider
```
