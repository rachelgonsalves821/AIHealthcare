export const JOB_NAMES = {
  EVIDENCE_GENERATE: 'evidence.generate',
  APPEAL_DRAFT: 'appeal.draft',
  CRITERIA_REFRESH: 'criteria.refresh',
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

export interface EvidenceGeneratePayload {
  caseId: string;
  orgId: string;
  requestedByUserId: string;
}

export interface AppealDraftPayload {
  caseId: string;
  orgId: string;
  requestedByUserId: string;
}

export interface CriteriaRefreshPayload {
  payerId?: string;
}
