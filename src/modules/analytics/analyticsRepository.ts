import { prisma } from '../../lib/prisma';

export interface DenialWinRateRow {
  payerId: string;
  payerName: string;
  denialReason: string | null;
  total: number;
  approved: number;
  upheld: number;
  partial: number;
  totalRecoveredValueCents: number;
  winRate: number;
}

export async function getDenialWinRates(): Promise<DenialWinRateRow[]> {
  const rows = await prisma.outcome.groupBy({
    by: ['payerId', 'denialReason', 'resolution'],
    _count: { id: true },
    _sum: { recoveredValueCents: true },
  });

  const payerIds = [...new Set(rows.map((r) => r.payerId))];
  const payers = await prisma.payer.findMany({
    where: { id: { in: payerIds } },
    select: { id: true, name: true },
  });
  const payerMap = Object.fromEntries(payers.map((p) => [p.id, p.name]));

  // Aggregate by payerId + denialReason
  const aggregated = new Map<string, DenialWinRateRow>();
  for (const row of rows) {
    const key = `${row.payerId}::${row.denialReason ?? ''}`;
    if (!aggregated.has(key)) {
      aggregated.set(key, {
        payerId: row.payerId,
        payerName: payerMap[row.payerId] ?? row.payerId,
        denialReason: row.denialReason,
        total: 0,
        approved: 0,
        upheld: 0,
        partial: 0,
        totalRecoveredValueCents: 0,
        winRate: 0,
      });
    }
    const agg = aggregated.get(key)!;
    const count = row._count.id;
    const recovered = row._sum.recoveredValueCents ?? 0;
    agg.total += count;
    agg.totalRecoveredValueCents += recovered;
    if (row.resolution === 'APPROVED') agg.approved += count;
    else if (row.resolution === 'UPHELD') agg.upheld += count;
    else if (row.resolution === 'PARTIAL') agg.partial += count;
  }

  for (const agg of aggregated.values()) {
    agg.winRate = agg.total > 0 ? (agg.approved + agg.partial) / agg.total : 0;
  }

  return [...aggregated.values()];
}
