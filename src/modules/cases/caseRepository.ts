import { Case, CaseStatus, CaseType, CaseSource, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';

export interface CreateCaseInput {
  orgId: string;
  patientId: string;
  payerId: string;
  serviceType: string;
  caseType: CaseType;
  source: CaseSource;
  externalRef?: string;
  complexityScore?: number;
  assignedUserId?: string;
}

export interface ListCasesFilter {
  orgId: string;
  status?: CaseStatus;
  payerId?: string;
  assignedUserId?: string;
}

export async function createCase(input: CreateCaseInput): Promise<Case> {
  return prisma.case.create({ data: input });
}

export async function getCaseById(id: string, orgId: string): Promise<Case> {
  const c = await prisma.case.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError('Case', id);
  return c;
}

export async function listCases(filter: ListCasesFilter): Promise<Case[]> {
  const where: Prisma.CaseWhereInput = { orgId: filter.orgId };
  if (filter.status) where.status = filter.status;
  if (filter.payerId) where.payerId = filter.payerId;
  if (filter.assignedUserId) where.assignedUserId = filter.assignedUserId;
  return prisma.case.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function updateCaseStatus(
  id: string,
  orgId: string,
  status: CaseStatus,
): Promise<Case> {
  return prisma.case.update({ where: { id }, data: { status, orgId } });
}

export async function updateCase(
  id: string,
  orgId: string,
  data: Partial<Pick<Case, 'assignedUserId' | 'recoveredValueCents' | 'complexityScore'>>,
): Promise<Case> {
  return prisma.case.update({ where: { id }, data: { ...data, orgId } });
}
