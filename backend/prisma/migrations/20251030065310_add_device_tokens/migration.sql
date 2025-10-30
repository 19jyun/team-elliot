/*
  Warnings:

  - You are about to drop the column `enrollment_id` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentId` on the `payments` table. All the data in the column will be lost.
  - Added the required column `session_enrollment_id` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "retention";

-- CreateEnum
CREATE TYPE "retention"."EnrollmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "retention"."SessionEnrollmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "retention"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "retention"."RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "retention"."AttendanceStatus" AS ENUM ('PENDING', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "retention"."DisputeType" AS ENUM ('REFUND_REJECTION', 'SERVICE_COMPLAINT', 'ENROLLMENT_REJECTION', 'PAYMENT_ISSUE', 'QUALITY_COMPLAINT', 'OTHER');

-- CreateEnum
CREATE TYPE "retention"."DisputeStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "retention"."DisputeSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_enrollmentId_fkey";

-- AlterTable
ALTER TABLE "public"."attendances" DROP COLUMN "enrollment_id",
ADD COLUMN     "session_enrollment_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."payments" DROP COLUMN "enrollmentId";

-- CreateTable
CREATE TABLE "public"."device_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."anonymized_users" (
    "id" SERIAL NOT NULL,
    "anonymous_id" VARCHAR(100) NOT NULL,
    "original_user_role" VARCHAR(20) NOT NULL,
    "withdrawal_date" TIMESTAMP(3) NOT NULL,
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_accessed_at" TIMESTAMP(3),
    "access_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "anonymized_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."anonymized_enrollments" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "class_name" VARCHAR(200) NOT NULL,
    "status" "retention"."EnrollmentStatus" NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "tuition_fee" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2),
    "refunded_amount" DECIMAL(10,2),
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_enrollment_id" INTEGER NOT NULL,

    CONSTRAINT "anonymized_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."anonymized_session_enrollments" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "status" "retention"."SessionEnrollmentStatus" NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_session_enrollment_id" INTEGER NOT NULL,

    CONSTRAINT "anonymized_session_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."anonymized_payments" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "enrollment_reference" VARCHAR(50),
    "session_enrollment_reference" VARCHAR(50),
    "academy_id" INTEGER NOT NULL,
    "class_id" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" VARCHAR(50) NOT NULL,
    "status" "retention"."PaymentStatus" NOT NULL,
    "paid_at" TIMESTAMP(3),
    "receipt_number" VARCHAR(100),
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_payment_id" INTEGER NOT NULL,

    CONSTRAINT "anonymized_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."anonymized_refunds" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "session_enrollment_reference" VARCHAR(50) NOT NULL,
    "enrollment_reference" VARCHAR(50),
    "academy_id" INTEGER NOT NULL,
    "class_id" INTEGER,
    "reason" TEXT NOT NULL,
    "detailed_reason" TEXT,
    "requested_amount" DECIMAL(10,2) NOT NULL,
    "actual_refund_amount" DECIMAL(10,2),
    "status" "retention"."RefundStatus" NOT NULL,
    "process_reason" TEXT,
    "processed_by_role" VARCHAR(20),
    "requested_at" TIMESTAMP(3) NOT NULL,
    "processed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_refund_request_id" INTEGER NOT NULL,

    CONSTRAINT "anonymized_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."anonymized_attendances" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "enrollment_reference" VARCHAR(50) NOT NULL,
    "attendance_date" TIMESTAMP(3) NOT NULL,
    "status" "retention"."AttendanceStatus" NOT NULL,
    "note" TEXT,
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "original_attendance_id" INTEGER NOT NULL,

    CONSTRAINT "anonymized_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."anonymized_disputes" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "dispute_type" "retention"."DisputeType" NOT NULL,
    "related_entity_type" VARCHAR(50) NOT NULL,
    "related_entity_ref" VARCHAR(50) NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "retention"."DisputeStatus" NOT NULL,
    "resolution" TEXT,
    "compensation_amount" DECIMAL(10,2),
    "resolved_by_role" VARCHAR(20),
    "reported_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "retention"."DisputeSeverity" NOT NULL DEFAULT 'MEDIUM',

    CONSTRAINT "anonymized_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."data_deletion_logs" (
    "id" SERIAL NOT NULL,
    "anonymous_id" VARCHAR(100) NOT NULL,
    "original_user_role" VARCHAR(20) NOT NULL,
    "withdrawal_date" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,
    "deletion_reason" VARCHAR(100) NOT NULL,
    "enrollments_deleted" INTEGER NOT NULL DEFAULT 0,
    "payments_deleted" INTEGER NOT NULL DEFAULT 0,
    "refunds_deleted" INTEGER NOT NULL DEFAULT 0,
    "attendances_deleted" INTEGER NOT NULL DEFAULT 0,
    "disputes_deleted" INTEGER NOT NULL DEFAULT 0,
    "deleted_by_system" BOOLEAN NOT NULL DEFAULT true,
    "deleted_by_user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "data_deletion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."data_access_logs" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "anonymous_id" VARCHAR(100) NOT NULL,
    "accessed_by" INTEGER NOT NULL,
    "accessed_by_role" VARCHAR(20) NOT NULL,
    "access_type" VARCHAR(50) NOT NULL,
    "access_reason" TEXT NOT NULL,
    "data_types_accessed" TEXT[],
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "public"."device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_is_active_idx" ON "public"."device_tokens"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_user_id_token_key" ON "public"."device_tokens"("user_id", "token");

-- CreateIndex
CREATE UNIQUE INDEX "anonymized_users_anonymous_id_key" ON "retention"."anonymized_users"("anonymous_id");

-- CreateIndex
CREATE INDEX "anonymized_users_data_retention_until_idx" ON "retention"."anonymized_users"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_users_withdrawal_date_idx" ON "retention"."anonymized_users"("withdrawal_date");

-- CreateIndex
CREATE INDEX "anonymized_users_original_user_role_idx" ON "retention"."anonymized_users"("original_user_role");

-- CreateIndex
CREATE INDEX "anonymized_enrollments_anonymous_user_id_idx" ON "retention"."anonymized_enrollments"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "anonymized_enrollments_data_retention_until_idx" ON "retention"."anonymized_enrollments"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_enrollments_status_idx" ON "retention"."anonymized_enrollments"("status");

-- CreateIndex
CREATE INDEX "anonymized_enrollments_enrolled_at_idx" ON "retention"."anonymized_enrollments"("enrolled_at");

-- CreateIndex
CREATE INDEX "anonymized_enrollments_academy_id_idx" ON "retention"."anonymized_enrollments"("academy_id");

-- CreateIndex
CREATE INDEX "anonymized_session_enrollments_anonymous_user_id_idx" ON "retention"."anonymized_session_enrollments"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "anonymized_session_enrollments_data_retention_until_idx" ON "retention"."anonymized_session_enrollments"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_session_enrollments_status_idx" ON "retention"."anonymized_session_enrollments"("status");

-- CreateIndex
CREATE INDEX "anonymized_session_enrollments_session_date_idx" ON "retention"."anonymized_session_enrollments"("session_date");

-- CreateIndex
CREATE INDEX "anonymized_payments_anonymous_user_id_idx" ON "retention"."anonymized_payments"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "anonymized_payments_data_retention_until_idx" ON "retention"."anonymized_payments"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_payments_status_idx" ON "retention"."anonymized_payments"("status");

-- CreateIndex
CREATE INDEX "anonymized_payments_paid_at_idx" ON "retention"."anonymized_payments"("paid_at");

-- CreateIndex
CREATE INDEX "anonymized_payments_academy_id_idx" ON "retention"."anonymized_payments"("academy_id");

-- CreateIndex
CREATE INDEX "anonymized_refunds_anonymous_user_id_idx" ON "retention"."anonymized_refunds"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "anonymized_refunds_data_retention_until_idx" ON "retention"."anonymized_refunds"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_refunds_status_idx" ON "retention"."anonymized_refunds"("status");

-- CreateIndex
CREATE INDEX "anonymized_refunds_requested_at_idx" ON "retention"."anonymized_refunds"("requested_at");

-- CreateIndex
CREATE INDEX "anonymized_refunds_academy_id_idx" ON "retention"."anonymized_refunds"("academy_id");

-- CreateIndex
CREATE INDEX "anonymized_attendances_anonymous_user_id_idx" ON "retention"."anonymized_attendances"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "anonymized_attendances_data_retention_until_idx" ON "retention"."anonymized_attendances"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_attendances_attendance_date_idx" ON "retention"."anonymized_attendances"("attendance_date");

-- CreateIndex
CREATE INDEX "anonymized_attendances_academy_id_idx" ON "retention"."anonymized_attendances"("academy_id");

-- CreateIndex
CREATE INDEX "anonymized_disputes_anonymous_user_id_idx" ON "retention"."anonymized_disputes"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "anonymized_disputes_data_retention_until_idx" ON "retention"."anonymized_disputes"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_disputes_dispute_type_idx" ON "retention"."anonymized_disputes"("dispute_type");

-- CreateIndex
CREATE INDEX "anonymized_disputes_status_idx" ON "retention"."anonymized_disputes"("status");

-- CreateIndex
CREATE INDEX "anonymized_disputes_reported_at_idx" ON "retention"."anonymized_disputes"("reported_at");

-- CreateIndex
CREATE INDEX "anonymized_disputes_academy_id_idx" ON "retention"."anonymized_disputes"("academy_id");

-- CreateIndex
CREATE INDEX "data_deletion_logs_anonymous_id_idx" ON "retention"."data_deletion_logs"("anonymous_id");

-- CreateIndex
CREATE INDEX "data_deletion_logs_deleted_at_idx" ON "retention"."data_deletion_logs"("deleted_at");

-- CreateIndex
CREATE INDEX "data_deletion_logs_deletion_reason_idx" ON "retention"."data_deletion_logs"("deletion_reason");

-- CreateIndex
CREATE INDEX "data_access_logs_anonymous_user_id_idx" ON "retention"."data_access_logs"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "data_access_logs_accessed_by_idx" ON "retention"."data_access_logs"("accessed_by");

-- CreateIndex
CREATE INDEX "data_access_logs_accessed_at_idx" ON "retention"."data_access_logs"("accessed_at");

-- CreateIndex
CREATE INDEX "data_access_logs_anonymous_id_idx" ON "retention"."data_access_logs"("anonymous_id");

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_session_enrollment_id_fkey" FOREIGN KEY ("session_enrollment_id") REFERENCES "public"."session_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention"."anonymized_enrollments" ADD CONSTRAINT "anonymized_enrollments_anonymous_user_id_fkey" FOREIGN KEY ("anonymous_user_id") REFERENCES "retention"."anonymized_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention"."anonymized_session_enrollments" ADD CONSTRAINT "anonymized_session_enrollments_anonymous_user_id_fkey" FOREIGN KEY ("anonymous_user_id") REFERENCES "retention"."anonymized_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention"."anonymized_payments" ADD CONSTRAINT "anonymized_payments_anonymous_user_id_fkey" FOREIGN KEY ("anonymous_user_id") REFERENCES "retention"."anonymized_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention"."anonymized_refunds" ADD CONSTRAINT "anonymized_refunds_anonymous_user_id_fkey" FOREIGN KEY ("anonymous_user_id") REFERENCES "retention"."anonymized_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention"."anonymized_attendances" ADD CONSTRAINT "anonymized_attendances_anonymous_user_id_fkey" FOREIGN KEY ("anonymous_user_id") REFERENCES "retention"."anonymized_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention"."anonymized_disputes" ADD CONSTRAINT "anonymized_disputes_anonymous_user_id_fkey" FOREIGN KEY ("anonymous_user_id") REFERENCES "retention"."anonymized_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
