/*
  Warnings:

  - You are about to drop the column `current_students` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `registration_end_date` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `registration_month` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `registration_start_date` on the `classes` table. All the data in the column will be lost.
  - Added the required column `max_students` to the `class_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN     "current_students" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "max_students" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "current_students",
DROP COLUMN "registration_end_date",
DROP COLUMN "registration_month",
DROP COLUMN "registration_start_date";
