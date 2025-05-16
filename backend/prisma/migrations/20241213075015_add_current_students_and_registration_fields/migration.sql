/*
  Warnings:

  - You are about to drop the column `enrollment_date` on the `enrollments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[class_id,student_id]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `registration_end_date` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_month` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_start_date` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Made the column `max_students` on table `classes` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `month` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "current_students" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "registration_end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "registration_month" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "registration_start_date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "max_students" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "enrollment_date",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "month" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_class_id_student_id_key" ON "enrollments"("class_id", "student_id");
