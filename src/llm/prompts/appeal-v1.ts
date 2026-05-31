export function buildAppealPrompt(input: {
  serviceType: string;
  evidenceSummary: Record<string, unknown>;
  citedCriteria: Array<{ id: string; version: number }>;
}): string {
  return `You are a clinical appeals specialist drafting an appeal letter on behalf of a licensed clinician.

Service Type: ${input.serviceType}

Evidence Summary:
${JSON.stringify(input.evidenceSummary, null, 2)}

Cited Criteria: ${input.citedCriteria.map((c) => `${c.id} v${c.version}`).join(', ')}

Task: Draft a professional appeal letter that:
1. Clearly states the basis for the appeal
2. Cites specific payer criteria that are met
3. References the clinical evidence
4. Requests specific action (approval / reconsideration)
5. Uses appropriate medical and legal language

IMPORTANT: This is a DRAFT for clinician review. The letter will NOT be submitted until a licensed clinician reviews and signs off on it. Do not include a signature block — that will be added after sign-off.`;
}
