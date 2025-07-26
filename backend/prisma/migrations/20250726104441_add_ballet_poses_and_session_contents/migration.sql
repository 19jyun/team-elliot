-- CreateEnum
CREATE TYPE "PoseDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "ballet_poses" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "image_url" VARCHAR(255),
    "description" TEXT NOT NULL,
    "difficulty" "PoseDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ballet_poses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_contents" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "pose_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_contents_session_id_pose_id_order_key" ON "session_contents"("session_id", "pose_id", "order");

-- AddForeignKey
ALTER TABLE "session_contents" ADD CONSTRAINT "session_contents_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_contents" ADD CONSTRAINT "session_contents_pose_id_fkey" FOREIGN KEY ("pose_id") REFERENCES "ballet_poses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
