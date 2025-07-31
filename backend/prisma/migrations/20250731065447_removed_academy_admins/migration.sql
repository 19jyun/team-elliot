/*
  Warnings:

  - You are about to drop the `academy_admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "academy_admins" DROP CONSTRAINT "academy_admins_academy_id_fkey";

-- DropForeignKey
ALTER TABLE "academy_admins" DROP CONSTRAINT "academy_admins_teacher_id_fkey";

-- DropTable
DROP TABLE "academy_admins";

-- DropEnum
DROP TYPE "AdminRole";
