/*
  Warnings:

  - Changed the type of `role` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING 
  CASE 
    WHEN role = 'admin' THEN 'ADMIN'::"Role"
    WHEN role = 'teacher' THEN 'TEACHER'::"Role"
    WHEN role = 'student' THEN 'STUDENT'::"Role"
  END;
