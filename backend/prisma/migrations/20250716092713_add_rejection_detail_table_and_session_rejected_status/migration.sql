-- CreateEnum
CREATE TYPE "RejectionType" AS ENUM ('ENROLLMENT_REJECTION', 'REFUND_REJECTION', 'SESSION_ENROLLMENT_REJECTION');

-- AlterTable
ALTER TABLE "session_enrollments" ADD COLUMN     "rejected_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "rejection_details" (
    "id" SERIAL NOT NULL,
    "rejection_type" "RejectionType" NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "entity_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detailed_reason" TEXT,
    "rejected_by" INTEGER NOT NULL,
    "rejected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rejection_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rejection_details_rejection_type_entity_id_idx" ON "rejection_details"("rejection_type", "entity_id");

-- CreateIndex
CREATE INDEX "rejection_details_rejected_by_rejected_at_idx" ON "rejection_details"("rejected_by", "rejected_at");

-- CreateIndex
CREATE INDEX "rejection_details_entity_type_entity_id_idx" ON "rejection_details"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "rejection_details" ADD CONSTRAINT "rejection_details_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
