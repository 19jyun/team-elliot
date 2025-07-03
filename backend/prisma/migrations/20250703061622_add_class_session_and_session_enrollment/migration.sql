/*
  Warnings:

  - You are about to drop the column `enrollment_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[session_enrollment_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `session_enrollment_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_enrollment_id_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "enrollment_id",
DROP COLUMN "month",
ADD COLUMN     "enrollmentId" INTEGER,
ADD COLUMN     "session_enrollment_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "class_sessions" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "session_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_enrollments" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "session_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_sessions_class_id_session_date_key" ON "class_sessions"("class_id", "session_date");

-- CreateIndex
CREATE UNIQUE INDEX "session_enrollments_student_id_session_id_key" ON "session_enrollments"("student_id", "session_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_session_enrollment_id_key" ON "payments"("session_enrollment_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_session_enrollment_id_fkey" FOREIGN KEY ("session_enrollment_id") REFERENCES "session_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_enrollments" ADD CONSTRAINT "session_enrollments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_enrollments" ADD CONSTRAINT "session_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
