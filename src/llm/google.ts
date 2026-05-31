import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMProvider, EvidenceGenerationInput, AppealDraftInput, LLMResult } from './provider';
import { buildEvidencePrompt } from './prompts/evidence-v1';
import { buildAppealPrompt } from './prompts/appeal-v1';

export class GoogleLLMProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env['GOOGLE_AI_API_KEY'] ?? '';
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env['LLM_MODEL'] ?? 'gemini-2.0-flash';
  }

  async generateEvidence(input: EvidenceGenerationInput): Promise<LLMResult> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const prompt = buildEvidencePrompt(input);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    let parsed: Record<string, unknown>;
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      parsed = { rawContent: text };
    }

    return {
      content: parsed,
      model: this.modelName,
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
    };
  }

  async generateAppealDraft(input: AppealDraftInput): Promise<LLMResult & { content: string }> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const prompt = buildAppealPrompt(input);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    return {
      content: text,
      model: this.modelName,
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
    };
  }
}
