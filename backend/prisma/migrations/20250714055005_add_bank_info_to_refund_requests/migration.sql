-- AlterTable
ALTER TABLE "refund_requests" ADD COLUMN     "account_holder" VARCHAR(50),
ADD COLUMN     "account_number" VARCHAR(20),
ADD COLUMN     "bank_name" VARCHAR(50);
