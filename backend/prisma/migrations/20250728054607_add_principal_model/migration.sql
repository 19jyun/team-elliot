-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PRINCIPAL';

-- CreateTable
CREATE TABLE "principals" (
    "id" SERIAL NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "email" VARCHAR(255),
    "introduction" TEXT,
    "photo_url" VARCHAR(255),
    "education" TEXT[],
    "certifications" TEXT[],
    "years_of_experience" INTEGER,
    "academy_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "principals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "principals_userId_key" ON "principals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "principals_academy_id_key" ON "principals"("academy_id");

-- AddForeignKey
ALTER TABLE "principals" ADD CONSTRAINT "principals_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
