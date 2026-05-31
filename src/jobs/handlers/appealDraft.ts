import { logger } from '../../lib/logger';
import { getLLMProvider } from '../../llm/provider';
import * as caseRepo from '../../modules/cases/caseRepository';
import * as evidenceRepo from '../../modules/evidence/evidenceRepository';
import * as appealRepo from '../../modules/appeals/appealRepository';
import * as caseSvc from '../../modules/cases/caseService';
import { CaseStatus } from '@prisma/client';
import type { AppealDraftPayload } from '../definitions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleAppealDraft(job: any): Promise<void> {
  const { caseId, orgId, requestedByUserId } = job.data as AppealDraftPayload;
  const jobLogger = logger.child({ job: 'appeal.draft', caseId, jobId: job.id });

  jobLogger.info('Starting appeal draft generation');
  const startMs = Date.now();

  const caseRecord = await caseRepo.getCaseById(caseId, orgId);
  const evidencePacks = await evidenceRepo.getEvidencePacksByCaseId(caseId);
  const latestEvidence = evidencePacks[0];
  if (!latestEvidence) {
    throw new Error(`No evidence pack found for case ${caseId} — run evidence.generate first`);
  }

  const llm = getLLMProvider();
  const { content, model, inputTokens, outputTokens } = await llm.generateAppealDraft({
    caseId,
    serviceType: caseRecord.serviceType,
    evidenceSummary: latestEvidence.clinicalEvidence as Record<string, unknown>,
    citedCriteria: latestEvidence.citedCriteria as Array<{ id: string; version: number }>,
  });

  const latencyMs = Date.now() - startMs;
  jobLogger.info({ model, inputTokens, outputTokens, latencyMs }, 'LLM appeal draft complete');

  await appealRepo.createAppeal({
    caseId,
    draftContent: content as string,
    draftedByModel: model,
  });

  await caseSvc.transitionStatus(caseId, orgId, CaseStatus.APPEAL_DRAFTED, requestedByUserId);
  jobLogger.info('Appeal draft created, case advanced to APPEAL_DRAFTED');
}
