-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('HEALTH_SYSTEM', 'SPECIALTY_GROUP', 'VENDOR_PARTNER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RCM_STAFF', 'CLINICIAN', 'REVIEWER');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('PRIOR_AUTH', 'DENIAL');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('RECEIVED', 'TRIAGED', 'EVIDENCE_READY', 'P2P_SCHEDULED', 'APPEAL_DRAFTED', 'SUBMITTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "CaseSource" AS ENUM ('EHR', 'RCM', 'VENDOR_HANDOFF');

-- CreateEnum
CREATE TYPE "EvidencePackStatus" AS ENUM ('DRAFT', 'REVIEWED');

-- CreateEnum
CREATE TYPE "P2POutcome" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('DRAFT', 'AWAITING_SIGNOFF', 'SIGNED', 'SUBMITTED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "OutcomeResolution" AS ENUM ('APPROVED', 'UPHELD', 'PARTIAL');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "externalMrnHash" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "sex" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payer_criteria" (
    "id" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "criteriaText" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supersededById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payer_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "caseType" "CaseType" NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'RECEIVED',
    "complexityScore" DOUBLE PRECISION,
    "source" "CaseSource" NOT NULL,
    "externalRef" TEXT,
    "assignedUserId" TEXT,
    "recoveredValueCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_packs" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "generatedByUserId" TEXT,
    "clinicalEvidence" JSONB NOT NULL,
    "citedCriteria" JSONB NOT NULL,
    "llmModel" TEXT NOT NULL,
    "status" "EvidencePackStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "evidence_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_to_peer_reviews" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "reviewingPhysicianId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "payerReviewerName" TEXT,
    "prepPackRef" TEXT,
    "outcome" "P2POutcome" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "peer_to_peer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable: appeals with CHECK constraint enforcing clinician sign-off before submission
-- Hard constraint: status='SUBMITTED' requires both clinicianSignoffUserId and signedOffAt.
CREATE TABLE "appeals" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "draftContent" TEXT NOT NULL,
    "draftedByModel" TEXT NOT NULL,
    "clinicianSignoffUserId" TEXT,
    "signedOffAt" TIMESTAMP(3),
    "status" "AppealStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "appeals_pkey" PRIMARY KEY ("id"),
    -- Regulatory constraint: an appeal cannot be SUBMITTED without recorded clinician sign-off
    CONSTRAINT "appeals_signoff_required_for_submission"
        CHECK (
            status != 'SUBMITTED' OR
            (clinicianSignoffUserId IS NOT NULL AND "signedOffAt" IS NOT NULL)
        )
);

-- CreateTable
CREATE TABLE "outcomes" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "denialReason" TEXT,
    "resolution" "OutcomeResolution" NOT NULL,
    "recoveredValueCents" INTEGER,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: audit_logs is append-only (no UPDATE/DELETE paths in code)
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "users"("clerkUserId");
CREATE UNIQUE INDEX "patients_orgId_externalMrnHash_key" ON "patients"("orgId", "externalMrnHash");
CREATE UNIQUE INDEX "payers_externalId_key" ON "payers"("externalId");
CREATE UNIQUE INDEX "payer_criteria_supersededById_key" ON "payer_criteria"("supersededById");

-- CreateIndex: performance indexes
CREATE INDEX "users_orgId_idx" ON "users"("orgId");
CREATE INDEX "users_clerkUserId_idx" ON "users"("clerkUserId");
CREATE INDEX "patients_orgId_idx" ON "patients"("orgId");
CREATE INDEX "cases_orgId_status_idx" ON "cases"("orgId", "status");
CREATE INDEX "cases_orgId_payerId_idx" ON "cases"("orgId", "payerId");
CREATE INDEX "cases_assignedUserId_idx" ON "cases"("assignedUserId");
CREATE INDEX "evidence_packs_caseId_idx" ON "evidence_packs"("caseId");
CREATE INDEX "peer_to_peer_reviews_caseId_idx" ON "peer_to_peer_reviews"("caseId");
CREATE INDEX "appeals_caseId_idx" ON "appeals"("caseId");
CREATE INDEX "outcomes_payerId_resolution_idx" ON "outcomes"("payerId", "resolution");
CREATE INDEX "payer_criteria_payerId_serviceType_region_idx" ON "payer_criteria"("payerId", "serviceType", "region");
CREATE INDEX "audit_logs_orgId_entityType_entityId_idx" ON "audit_logs"("orgId", "entityType", "entityId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "patients" ADD CONSTRAINT "patients_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payer_criteria" ADD CONSTRAINT "payer_criteria_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payer_criteria" ADD CONSTRAINT "payer_criteria_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "payer_criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cases" ADD CONSTRAINT "cases_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cases" ADD CONSTRAINT "cases_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cases" ADD CONSTRAINT "cases_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cases" ADD CONSTRAINT "cases_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidence_packs" ADD CONSTRAINT "evidence_packs_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence_packs" ADD CONSTRAINT "evidence_packs_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "peer_to_peer_reviews" ADD CONSTRAINT "peer_to_peer_reviews_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "peer_to_peer_reviews" ADD CONSTRAINT "peer_to_peer_reviews_reviewingPhysicianId_fkey" FOREIGN KEY ("reviewingPhysicianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_clinicianSignoffUserId_fkey" FOREIGN KEY ("clinicianSignoffUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "payers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
