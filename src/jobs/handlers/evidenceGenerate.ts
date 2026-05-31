import { logger } from '../../lib/logger';
import { getLLMProvider } from '../../llm/provider';
import * as caseRepo from '../../modules/cases/caseRepository';
import * as evidenceRepo from '../../modules/evidence/evidenceRepository';
import * as caseSvc from '../../modules/cases/caseService';
import * as payerRepo from '../../modules/payers/payerRepository';
import { CaseStatus, type Prisma } from '@prisma/client';
import type { EvidenceGeneratePayload } from '../definitions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleEvidenceGenerate(job: any): Promise<void> {
  const { caseId, orgId, requestedByUserId } = job.data as EvidenceGeneratePayload;
  const jobLogger = logger.child({ job: 'evidence.generate', caseId, jobId: job.id });

  jobLogger.info('Starting evidence generation');
  const startMs = Date.now();

  const caseRecord = await caseRepo.getCaseById(caseId, orgId);
  const criteria = await payerRepo.getCurrentCriteria(caseRecord.payerId, caseRecord.serviceType);

  const llm = getLLMProvider();
  const { content, model, inputTokens, outputTokens } = await llm.generateEvidence({
    caseId,
    serviceType: caseRecord.serviceType,
    criteriaTexts: criteria.map((c) => ({ id: c.id, version: c.version, text: c.criteriaText })),
  });

  const latencyMs = Date.now() - startMs;
  jobLogger.info({ model, inputTokens, outputTokens, latencyMs }, 'LLM evidence generation complete');

  await evidenceRepo.createEvidencePack({
    caseId,
    generatedByUserId: requestedByUserId,
    clinicalEvidence: content as Prisma.InputJsonObject,
    citedCriteria: criteria.map((c) => ({
      id: c.id,
      version: c.version,
      serviceType: c.serviceType,
    })) as Prisma.InputJsonValue,
    llmModel: model,
  });

  await caseSvc.transitionStatus(caseId, orgId, CaseStatus.EVIDENCE_READY, requestedByUserId);
  jobLogger.info('Evidence generation complete, case advanced to EVIDENCE_READY');
}
