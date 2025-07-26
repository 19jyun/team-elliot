-- CreateEnum
CREATE TYPE "AcademyRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "academy_join_requests" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "status" "AcademyRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_creation_requests" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "AcademyRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_creation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academy_join_requests_academy_id_status_idx" ON "academy_join_requests"("academy_id", "status");

-- CreateIndex
CREATE INDEX "academy_join_requests_teacher_id_status_idx" ON "academy_join_requests"("teacher_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "academy_join_requests_teacher_id_academy_id_key" ON "academy_join_requests"("teacher_id", "academy_id");

-- CreateIndex
CREATE INDEX "academy_creation_requests_teacher_id_status_idx" ON "academy_creation_requests"("teacher_id", "status");

-- CreateIndex
CREATE INDEX "academy_creation_requests_status_createdAt_idx" ON "academy_creation_requests"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "academy_join_requests" ADD CONSTRAINT "academy_join_requests_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_join_requests" ADD CONSTRAINT "academy_join_requests_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_creation_requests" ADD CONSTRAINT "academy_creation_requests_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
