import 'dotenv/config';
import { getQueue, stopQueue } from './jobs/queue';
import { JOB_NAMES } from './jobs/definitions';
import { handleEvidenceGenerate } from './jobs/handlers/evidenceGenerate';
import { handleAppealDraft } from './jobs/handlers/appealDraft';
import { handleCriteriaRefresh } from './jobs/handlers/criteriaRefresh';
import { getLLMProvider, setLLMProvider } from './llm/provider';
import { config } from './config';
import { logger } from './lib/logger';

async function bootstrapLLM() {
  if (config.LLM_PROVIDER === 'mock') {
    const { MockLLMProvider } = await import('./llm/mock');
    setLLMProvider(new MockLLMProvider());
  } else if (config.LLM_PROVIDER === 'google') {
    const { GoogleLLMProvider } = await import('./llm/google');
    setLLMProvider(new GoogleLLMProvider());
  } else {
    const { AnthropicLLMProvider } = await import('./llm/anthropic');
    setLLMProvider(new AnthropicLLMProvider());
  }
}

async function main() {
  await bootstrapLLM();
  // Verify provider initialized
  getLLMProvider();

  const boss = await getQueue();

  boss.work(JOB_NAMES.EVIDENCE_GENERATE, handleEvidenceGenerate);
  boss.work(JOB_NAMES.APPEAL_DRAFT, handleAppealDraft);
  boss.work(JOB_NAMES.CRITERIA_REFRESH, handleCriteriaRefresh);

  await boss.schedule(JOB_NAMES.CRITERIA_REFRESH, '0 6 * * *', {});

  logger.info('Worker started — listening for jobs');

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received — stopping worker');
    await stopQueue();
    process.exit(0);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Worker failed to start');
  process.exit(1);
});

export {};
