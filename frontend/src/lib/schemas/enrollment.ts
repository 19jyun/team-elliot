// src/lib/schemas/enrollment.ts

import { z } from "zod";

// [Step 1] 학원 선택
export const enrollmentAcademySchema = z.object({
  academyId: z.number().min(1, "학원을 선택해주세요."),
});

// [Step 2] 클래스 선택
export const enrollmentClassSchema = z.object({
  classIds: z
    .array(z.number())
    .min(1, "최소 1개 이상의 클래스를 선택해주세요."),
});

// [Step 3] 날짜(세션) 선택
export const enrollmentDateSchema = z.object({
  sessionIds: z
    .array(z.number())
    .min(1, "최소 1개 이상의 세션을 선택해주세요."),
});

// [Step 4] 결제/확인
export const enrollmentPaymentSchema = z.object({
  confirmed: z.boolean().refine((val) => val === true, {
    message: "입금 확인에 동의해주세요.",
  }),
});

export type EnrollmentAcademySchemaType = z.infer<
  typeof enrollmentAcademySchema
>;
export type EnrollmentClassSchemaType = z.infer<typeof enrollmentClassSchema>;
export type EnrollmentDateSchemaType = z.infer<typeof enrollmentDateSchema>;
export type EnrollmentPaymentSchemaType = z.infer<
  typeof enrollmentPaymentSchema
>;
