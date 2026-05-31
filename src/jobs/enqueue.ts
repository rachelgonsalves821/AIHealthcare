import { getQueue } from './queue';
import { JOB_NAMES } from './definitions';
import type { EvidenceGeneratePayload, AppealDraftPayload } from './definitions';

export async function enqueueEvidenceGenerate(payload: EvidenceGeneratePayload): Promise<string | null> {
  const boss = await getQueue();
  return boss.send(JOB_NAMES.EVIDENCE_GENERATE, payload, {
    singletonKey: `evidence:${payload.caseId}`,
    retryLimit: 3,
    retryDelay: 30,
  });
}

export async function enqueueAppealDraft(payload: AppealDraftPayload): Promise<string | null> {
  const boss = await getQueue();
  return boss.send(JOB_NAMES.APPEAL_DRAFT, payload, {
    singletonKey: `appeal:${payload.caseId}`,
    retryLimit: 3,
    retryDelay: 30,
  });
}
