/*
  Warnings:

  - A unique constraint covering the columns `[user_ref_id]` on the table `principals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_ref_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_ref_id]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_ref_id` to the `principals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_ref_id` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_ref_id` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "principals" ADD COLUMN     "user_ref_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "user_ref_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "user_ref_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "principals_user_ref_id_key" ON "principals"("user_ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_ref_id_key" ON "students"("user_ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_ref_id_key" ON "teachers"("user_ref_id");

-- AddForeignKey
ALTER TABLE "principals" ADD CONSTRAINT "principals_user_ref_id_fkey" FOREIGN KEY ("user_ref_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_ref_id_fkey" FOREIGN KEY ("user_ref_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_ref_id_fkey" FOREIGN KEY ("user_ref_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
