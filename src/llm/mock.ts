import type { LLMProvider, EvidenceGenerationInput, AppealDraftInput, LLMResult } from './provider';

/**
 * Deterministic mock provider for tests — never makes network calls.
 */
export class MockLLMProvider implements LLMProvider {
  async generateEvidence(input: EvidenceGenerationInput): Promise<LLMResult> {
    return {
      content: {
        summary: `Mock clinical evidence for ${input.serviceType}`,
        criteriaMatched: input.criteriaTexts.map((c) => c.id),
        recommendation: 'APPROVE',
      },
      model: 'mock-model-v1',
      inputTokens: 100,
      outputTokens: 200,
    };
  }

  async generateAppealDraft(input: AppealDraftInput): Promise<LLMResult & { content: string }> {
    return {
      content: `MOCK APPEAL DRAFT for case ${input.caseId} (${input.serviceType}).\n\nBased on the clinical evidence and cited criteria, we respectfully appeal the denial.`,
      model: 'mock-model-v1',
      inputTokens: 150,
      outputTokens: 300,
    };
  }
}
