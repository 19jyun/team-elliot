// src/lib/schemas/class-create.ts

import { z } from "zod";

// [Step 1] 기본 정보
export const classInfoSchema = z.object({
  name: z.string().min(1, "강의명을 입력해주세요."),
  description: z.string().min(1, "강의 설명을 입력해주세요."),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    message: "난이도를 선택해주세요.",
  }),
  maxStudents: z.number().min(1, "최대 수강생 수는 1명 이상이어야 합니다."),
  price: z.number().min(0, "수강료는 0원 이상이어야 합니다."),
});

// [Step 2] 선생님 선택
export const classTeacherSchema = z.object({
  teacherId: z.number().min(1, "담당 선생님을 선택해주세요."),
});

// [Step 3] 일정 설정
export const scheduleItemSchema = z
  .object({
    dayOfWeek: z.number().min(0).max(6), // 0: 일요일 ~ 6: 토요일
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다."),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "시간 형식이 올바르지 않습니다."),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "종료 시간은 시작 시간보다 늦어야 합니다.",
    path: ["endTime"],
  });

export const classScheduleSchema = z
  .object({
    startDate: z.string().min(1, "시작일을 선택해주세요."),
    endDate: z.string().min(1, "종료일을 선택해주세요."),
    schedules: z
      .array(scheduleItemSchema)
      .min(1, "최소 하나의 수업 일정을 등록해주세요."),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "종료일은 시작일보다 늦어야 합니다.",
    path: ["endDate"],
  });

// [Step 4] 강의 상세
export const classDetailSchema = z.object({
  content: z.string().min(1, "강의 내용을 입력해주세요."),
});

// 타입 추출
export type ClassInfoSchemaType = z.infer<typeof classInfoSchema>;
export type ClassTeacherSchemaType = z.infer<typeof classTeacherSchema>;
export type ClassScheduleSchemaType = z.infer<typeof classScheduleSchema>;
export type ClassDetailSchemaType = z.infer<typeof classDetailSchema>;
