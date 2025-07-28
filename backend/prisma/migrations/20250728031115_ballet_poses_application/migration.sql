/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ballet_poses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ballet_poses_name_key" ON "ballet_poses"("name");
