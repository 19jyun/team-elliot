/*
  Warnings:

  - You are about to drop the column `process_action` on the `anonymized_teacher_activities` table. All the data in the column will be lost.
  - You are about to drop the column `process_reason` on the `anonymized_teacher_activities` table. All the data in the column will be lost.
  - You are about to drop the column `processed_amount` on the `anonymized_teacher_activities` table. All the data in the column will be lost.
  - You are about to drop the column `processed_at` on the `anonymized_teacher_activities` table. All the data in the column will be lost.
  - You are about to drop the column `processed_entity_id` on the `anonymized_teacher_activities` table. All the data in the column will be lost.
  - You are about to drop the column `processed_entity_type` on the `anonymized_teacher_activities` table. All the data in the column will be lost.
  - Made the column `class_id` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `class_name` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `academy_id` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tuition_fee` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `operation_start_date` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `operation_end_date` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_sessions` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_enrollments` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_revenue` on table `anonymized_teacher_activities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "retention"."anonymized_teacher_activities" DROP COLUMN "process_action",
DROP COLUMN "process_reason",
DROP COLUMN "processed_amount",
DROP COLUMN "processed_at",
DROP COLUMN "processed_entity_id",
DROP COLUMN "processed_entity_type",
ALTER COLUMN "class_id" SET NOT NULL,
ALTER COLUMN "class_name" SET NOT NULL,
ALTER COLUMN "academy_id" SET NOT NULL,
ALTER COLUMN "tuition_fee" SET NOT NULL,
ALTER COLUMN "operation_start_date" SET NOT NULL,
ALTER COLUMN "operation_end_date" SET NOT NULL,
ALTER COLUMN "total_sessions" SET NOT NULL,
ALTER COLUMN "total_enrollments" SET NOT NULL,
ALTER COLUMN "total_revenue" SET NOT NULL;
