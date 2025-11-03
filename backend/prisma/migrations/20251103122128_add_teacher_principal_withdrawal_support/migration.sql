-- CreateTable
CREATE TABLE "retention"."anonymized_teacher_activities" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "activity_type" VARCHAR(50) NOT NULL,
    "class_id" INTEGER,
    "class_name" VARCHAR(200),
    "academy_id" INTEGER,
    "tuition_fee" DECIMAL(10,2),
    "operation_start_date" TIMESTAMP(3),
    "operation_end_date" TIMESTAMP(3),
    "total_sessions" INTEGER,
    "total_enrollments" INTEGER,
    "total_revenue" DECIMAL(10,2),
    "processed_entity_type" VARCHAR(50),
    "processed_entity_id" INTEGER,
    "process_action" VARCHAR(20),
    "process_reason" TEXT,
    "processed_amount" DECIMAL(10,2),
    "processed_at" TIMESTAMP(3),
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymized_teacher_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention"."anonymized_principal_activities" (
    "id" SERIAL NOT NULL,
    "anonymous_user_id" INTEGER NOT NULL,
    "activity_type" VARCHAR(50) NOT NULL,
    "academy_id" INTEGER,
    "academy_name" VARCHAR(200),
    "academy_code" VARCHAR(50),
    "operation_start_date" TIMESTAMP(3),
    "operation_end_date" TIMESTAMP(3),
    "total_classes" INTEGER,
    "total_teachers" INTEGER,
    "total_students" INTEGER,
    "total_revenue" DECIMAL(10,2),
    "account_holder_masked" VARCHAR(50),
    "account_number_masked" VARCHAR(30),
    "bank_name" VARCHAR(50),
    "processed_entity_type" VARCHAR(50),
    "processed_entity_id" INTEGER,
    "process_action" VARCHAR(20),
    "process_reason" TEXT,
    "processed_amount" DECIMAL(10,2),
    "processed_at" TIMESTAMP(3),
    "managed_teacher_id" INTEGER,
    "management_action" VARCHAR(30),
    "managed_at" TIMESTAMP(3),
    "data_retention_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymized_principal_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "anonymized_teacher_activities_anonymous_user_id_idx" ON "retention"."anonymized_teacher_activities"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "anonymized_teacher_activities_activity_type_idx" ON "retention"."anonymized_teacher_activities"("activity_type");

-- CreateIndex
CREATE INDEX "anonymized_teacher_activities_data_retention_until_idx" ON "retention"."anonymized_teacher_activities"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_teacher_activities_academy_id_idx" ON "retention"."anonymized_teacher_activities"("academy_id");

-- CreateIndex
CREATE INDEX "anonymized_teacher_activities_class_id_idx" ON "retention"."anonymized_teacher_activities"("class_id");

-- CreateIndex
CREATE INDEX "anonymized_principal_activities_anonymous_user_id_idx" ON "retention"."anonymized_principal_activities"("anonymous_user_id");

-- CreateIndex
CREATE INDEX "anonymized_principal_activities_activity_type_idx" ON "retention"."anonymized_principal_activities"("activity_type");

-- CreateIndex
CREATE INDEX "anonymized_principal_activities_data_retention_until_idx" ON "retention"."anonymized_principal_activities"("data_retention_until");

-- CreateIndex
CREATE INDEX "anonymized_principal_activities_academy_id_idx" ON "retention"."anonymized_principal_activities"("academy_id");

-- AddForeignKey
ALTER TABLE "retention"."anonymized_teacher_activities" ADD CONSTRAINT "anonymized_teacher_activities_anonymous_user_id_fkey" FOREIGN KEY ("anonymous_user_id") REFERENCES "retention"."anonymized_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention"."anonymized_principal_activities" ADD CONSTRAINT "anonymized_principal_activities_anonymous_user_id_fkey" FOREIGN KEY ("anonymous_user_id") REFERENCES "retention"."anonymized_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
