/**
 * Synthetic seed data — NO real PHI ever stored here.
 * All patient data is synthetic, MRNs are hashed test values.
 */
import { PrismaClient, OrgType, UserRole, CaseType, CaseStatus, CaseSource } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'] ?? '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // Org
  const org = await prisma.organization.upsert({
    where: { id: 'seed-org-001' },
    update: {},
    create: {
      id: 'seed-org-001',
      name: 'Demo Health System',
      type: OrgType.HEALTH_SYSTEM,
    },
  });

  // Users — one per role
  const adminUser = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_seed_admin' },
    update: {},
    create: {
      id: 'seed-user-admin',
      orgId: org.id,
      clerkUserId: 'clerk_seed_admin',
      email: 'admin@demo.health',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const clinicianUser = await prisma.user.upsert({
    where: { clerkUserId: 'clerk_seed_clinician' },
    update: {},
    create: {
      id: 'seed-user-clinician',
      orgId: org.id,
      clerkUserId: 'clerk_seed_clinician',
      email: 'clinician@demo.health',
      name: 'Dr. Seed Clinician',
      role: UserRole.CLINICIAN,
    },
  });

  await prisma.user.upsert({
    where: { clerkUserId: 'clerk_seed_rcm' },
    update: {},
    create: {
      id: 'seed-user-rcm',
      orgId: org.id,
      clerkUserId: 'clerk_seed_rcm',
      email: 'rcm@demo.health',
      name: 'RCM Staff',
      role: UserRole.RCM_STAFF,
    },
  });

  await prisma.user.upsert({
    where: { clerkUserId: 'clerk_seed_reviewer' },
    update: {},
    create: {
      id: 'seed-user-reviewer',
      orgId: org.id,
      clerkUserId: 'clerk_seed_reviewer',
      email: 'reviewer@demo.health',
      name: 'Case Reviewer',
      role: UserRole.REVIEWER,
    },
  });

  // Payers
  const payerA = await prisma.payer.upsert({
    where: { externalId: 'BCBS-TX' },
    update: {},
    create: {
      id: 'seed-payer-bcbs',
      name: 'Blue Cross Blue Shield Texas',
      externalId: 'BCBS-TX',
      region: 'TX',
    },
  });

  const payerB = await prisma.payer.upsert({
    where: { externalId: 'AETNA-CA' },
    update: {},
    create: {
      id: 'seed-payer-aetna',
      name: 'Aetna California',
      externalId: 'AETNA-CA',
      region: 'CA',
    },
  });

  // Payer criteria (two versions for BCBS, to demonstrate versioning)
  const criteriaV1 = await prisma.payerCriteria.upsert({
    where: { id: 'seed-criteria-bcbs-v1' },
    update: {},
    create: {
      id: 'seed-criteria-bcbs-v1',
      payerId: payerA.id,
      serviceType: 'SPINAL_FUSION',
      region: 'TX',
      criteriaText:
        'Coverage requires 6 weeks conservative therapy, imaging evidence, and specialist referral.',
      sourceUrl: 'https://example.com/bcbs/criteria/spinal-fusion-v1',
      version: 1,
    },
  });

  await prisma.payerCriteria.upsert({
    where: { id: 'seed-criteria-bcbs-v2' },
    update: {},
    create: {
      id: 'seed-criteria-bcbs-v2',
      payerId: payerA.id,
      serviceType: 'SPINAL_FUSION',
      region: 'TX',
      criteriaText:
        'Coverage requires 6 weeks conservative therapy, imaging evidence, specialist referral, AND functional capacity evaluation.',
      sourceUrl: 'https://example.com/bcbs/criteria/spinal-fusion-v2',
      version: 2,
      supersededById: criteriaV1.id,
    },
  });

  await prisma.payerCriteria.upsert({
    where: { id: 'seed-criteria-aetna-v1' },
    update: {},
    create: {
      id: 'seed-criteria-aetna-v1',
      payerId: payerB.id,
      serviceType: 'MRI_LUMBAR',
      region: 'CA',
      criteriaText: 'MRI approved for radiculopathy with 4+ weeks conservative care failure.',
      version: 1,
    },
  });

  // Synthetic patient (hashed MRN — not a real MRN)
  const patient = await prisma.patient.upsert({
    where: { orgId_externalMrnHash: { orgId: org.id, externalMrnHash: 'sha256:deadbeef0001' } },
    update: {},
    create: {
      id: 'seed-patient-001',
      orgId: org.id,
      externalMrnHash: 'sha256:deadbeef0001',
      sex: 'F',
    },
  });

  // Seed case
  await prisma.case.upsert({
    where: { id: 'seed-case-001' },
    update: {},
    create: {
      id: 'seed-case-001',
      orgId: org.id,
      patientId: patient.id,
      payerId: payerA.id,
      serviceType: 'SPINAL_FUSION',
      caseType: CaseType.PRIOR_AUTH,
      status: CaseStatus.RECEIVED,
      source: CaseSource.VENDOR_HANDOFF,
      complexityScore: 0.87,
      externalRef: 'VENDOR-REF-001',
      assignedUserId: adminUser.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:', {
    org: org.id,
    clinician: clinicianUser.id,
    payerA: payerA.id,
    payerB: payerB.id,
    patient: patient.id,
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
