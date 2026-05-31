export interface EvidenceGenerationInput {
  caseId: string;
  serviceType: string;
  criteriaTexts: Array<{ id: string; version: number; text: string }>;
}

export interface AppealDraftInput {
  caseId: string;
  serviceType: string;
  evidenceSummary: Record<string, unknown>;
  citedCriteria: Array<{ id: string; version: number }>;
}

export interface LLMResult {
  content: string | Record<string, unknown>;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface LLMProvider {
  generateEvidence(input: EvidenceGenerationInput): Promise<LLMResult>;
  generateAppealDraft(input: AppealDraftInput): Promise<LLMResult & { content: string }>;
}

let _provider: LLMProvider | null = null;

export function setLLMProvider(p: LLMProvider): void {
  _provider = p;
}

export function getLLMProvider(): LLMProvider {
  if (!_provider) {
    throw new Error('LLM provider not initialized — call setLLMProvider() at startup');
  }
  return _provider;
}
