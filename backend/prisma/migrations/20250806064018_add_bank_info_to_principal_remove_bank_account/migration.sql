/*
  Warnings:

  - You are about to drop the `bank_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_teacher_id_fkey";

-- AlterTable
ALTER TABLE "principals" ADD COLUMN     "account_holder" VARCHAR(50),
ADD COLUMN     "account_number" VARCHAR(20),
ADD COLUMN     "bank_name" VARCHAR(50);

-- DropTable
DROP TABLE "bank_accounts";
