/*
  Warnings:

  - A unique constraint covering the columns `[admin_id]` on the table `academies` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_academy_id_fkey";

-- AlterTable
ALTER TABLE "academies" ADD COLUMN     "admin_id" INTEGER;

-- AlterTable
ALTER TABLE "teachers" ALTER COLUMN "academy_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "academies_admin_id_key" ON "academies"("admin_id");

-- AddForeignKey
ALTER TABLE "academies" ADD CONSTRAINT "academies_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기존 학원들의 첫 번째 선생님을 관리자로 설정
UPDATE "academies" 
SET "admin_id" = (
  SELECT t.id 
  FROM "teachers" t 
  WHERE t.academy_id = "academies".id 
  ORDER BY t."createdAt" 
  LIMIT 1
)
WHERE "admin_id" IS NULL;
