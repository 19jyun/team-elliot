/*
  Warnings:

  - You are about to drop the column `time` on the `classes` table. All the data in the column will be lost.
  - Added the required column `end_time` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `classes` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns as nullable first
ALTER TABLE "classes" ADD COLUMN "start_time" TIME,
ADD COLUMN "end_time" TIME;

-- Step 2: Migrate existing data from time to start_time and calculate end_time (assuming 1 hour duration)
UPDATE "classes" 
SET 
  "start_time" = "time"::time,
  "end_time" = ("time"::time + interval '1 hour')::time
WHERE "time" IS NOT NULL;

-- Step 3: Make columns non-nullable
ALTER TABLE "classes" ALTER COLUMN "start_time" SET NOT NULL,
ALTER COLUMN "end_time" SET NOT NULL;

-- Step 4: Drop the old time column
ALTER TABLE "classes" DROP COLUMN "time";
