/*
  Warnings:

  - You are about to drop the column `admin_id` on the `academies` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "academies" DROP CONSTRAINT "academies_admin_id_fkey";

-- DropIndex
DROP INDEX "academies_admin_id_key";

-- AlterTable
ALTER TABLE "academies" DROP COLUMN "admin_id";

-- CreateTable
CREATE TABLE "academy_admins" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academy_admins_academy_id_teacher_id_key" ON "academy_admins"("academy_id", "teacher_id");

-- AddForeignKey
ALTER TABLE "academy_admins" ADD CONSTRAINT "academy_admins_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_admins" ADD CONSTRAINT "academy_admins_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
