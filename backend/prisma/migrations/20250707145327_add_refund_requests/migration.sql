-- CreateTable
CREATE TABLE "refund_requests" (
    "id" SERIAL NOT NULL,
    "session_enrollment_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "detailed_reason" TEXT,
    "refund_amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "process_reason" TEXT,
    "actual_refund_amount" DECIMAL(10,2),
    "processed_by" INTEGER,
    "processed_at" TIMESTAMP(3),
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_session_enrollment_id_fkey" FOREIGN KEY ("session_enrollment_id") REFERENCES "session_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
