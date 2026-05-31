export function buildEvidencePrompt(input: {
  serviceType: string;
  criteriaTexts: Array<{ id: string; version: number; text: string }>;
}): string {
  const criteriaBlock = input.criteriaTexts
    .map((c) => `[Criteria ID: ${c.id} v${c.version}]\n${c.text}`)
    .join('\n\n');

  return `You are a clinical documentation specialist preparing evidence for a prior authorization or denial appeal.

Service Type: ${input.serviceType}

Payer Criteria:
${criteriaBlock}

Task: Analyze the relevant clinical documentation and produce a structured evidence summary that:
1. Identifies which criteria are met with supporting evidence
2. Flags any gaps in documentation
3. Provides a recommendation (APPROVE / NEEDS_ADDITIONAL_INFO / DENY)

Respond in JSON format:
{
  "summary": "...",
  "criteriaMatched": ["criteria_id_1", ...],
  "criteriaGaps": ["criteria_id_X", ...],
  "recommendation": "APPROVE | NEEDS_ADDITIONAL_INFO | DENY",
  "keyFindings": ["finding 1", ...]
}

IMPORTANT: You are producing a DRAFT only. No clinical decision is final without clinician review and sign-off.`;
}
