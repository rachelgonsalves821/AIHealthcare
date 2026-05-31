import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider, EvidenceGenerationInput, AppealDraftInput, LLMResult } from './provider';
import { buildEvidencePrompt } from './prompts/evidence-v1';
import { buildAppealPrompt } from './prompts/appeal-v1';

export class AnthropicLLMProvider implements LLMProvider {
  private client: Anthropic;
  private modelName: string;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
    this.modelName = process.env['LLM_MODEL'] ?? 'claude-opus-4-5';
  }

  async generateEvidence(input: EvidenceGenerationInput): Promise<LLMResult> {
    const prompt = buildEvidencePrompt(input);
    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    let parsed: Record<string, unknown>;
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      parsed = { rawContent: text };
    }

    return {
      content: parsed,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }

  async generateAppealDraft(input: AppealDraftInput): Promise<LLMResult & { content: string }> {
    const prompt = buildAppealPrompt(input);
    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    return {
      content: text,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
}
