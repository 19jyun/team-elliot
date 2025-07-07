/*
  Warnings:

  - Added the required column `academy_id` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academy_id` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "academies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_academies" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_academies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academies_code_key" ON "academies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "student_academies_student_id_academy_id_key" ON "student_academies"("student_id", "academy_id");

-- 기본 학원 데이터 삽입
INSERT INTO "academies" ("name", "phone_number", "address", "description", "code", "createdAt", "updatedAt") 
VALUES ('팀 엘리엇 발레 학원', '02-1234-5678', '서울특별시 강남구 테헤란로 123, 4층', '저희 팀 엘리엇 학원은 체계적이고 전문적인 발레 교육을 추구하는 강의를 진행합니다. 초보자부터 고급자까지 모든 레벨의 학생들을 위한 맞춤형 커리큘럼을 제공합니다.', 'TEAM_ELLIOT_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable - teachers 테이블에 academy_id 컬럼 추가
ALTER TABLE "teachers" ADD COLUMN "academy_id" INTEGER;

-- 기존 teachers 데이터에 기본 학원 ID 설정
UPDATE "teachers" SET "academy_id" = (SELECT "id" FROM "academies" WHERE "code" = 'TEAM_ELLIOT_001' LIMIT 1);

-- academy_id를 NOT NULL로 변경
ALTER TABLE "teachers" ALTER COLUMN "academy_id" SET NOT NULL;

-- AlterTable - classes 테이블에 academy_id 컬럼 추가
ALTER TABLE "classes" ADD COLUMN "academy_id" INTEGER;

-- 기존 classes 데이터에 기본 학원 ID 설정
UPDATE "classes" SET "academy_id" = (SELECT "id" FROM "academies" WHERE "code" = 'TEAM_ELLIOT_001' LIMIT 1);

-- academy_id를 NOT NULL로 변경
ALTER TABLE "classes" ALTER COLUMN "academy_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "student_academies" ADD CONSTRAINT "student_academies_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academies" ADD CONSTRAINT "student_academies_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
