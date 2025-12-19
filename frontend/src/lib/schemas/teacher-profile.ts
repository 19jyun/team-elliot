import { z } from "zod";

/**
 * 선생님 프로필 업데이트 스키마
 * 백엔드 UpdateProfileDto(Teacher)와 동일한 validation 규칙
 */
export const updateTeacherProfileSchema = z.object({
  // 이름: 2-50자, 한글/영문/공백만 허용
  name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다.")
    .max(50, "이름은 50자 이하여야 합니다.")
    .regex(/^[가-힣a-zA-Z\s]+$/, "이름은 한글, 영문, 공백만 사용 가능합니다.")
    .optional()
    .or(z.literal("")),

  // 전화번호: 01X-XXXX-XXXX 형식
  phoneNumber: z
    .string()
    .regex(
      /^01[0-9]-[0-9]{4}-[0-9]{4}$/,
      "전화번호는 01X-XXXX-XXXX 형식이어야 합니다."
    )
    .optional()
    .or(z.literal("")),

  // 소개: 1000자 이하
  introduction: z
    .string()
    .max(1000, "소개는 1000자 이하여야 합니다.")
    .optional()
    .or(z.literal("")),

  // 학력: 배열, 각 항목 200자 이하
  education: z
    .array(z.string().max(200, "각 학력 항목은 200자 이하여야 합니다."))
    .optional(),

  // 전문분야: 배열, 각 항목 100자 이하
  specialties: z
    .array(z.string().max(100, "각 전문분야 항목은 100자 이하여야 합니다."))
    .optional(),

  // 자격증: 배열, 각 항목 200자 이하
  certifications: z
    .array(z.string().max(200, "각 자격증 항목은 200자 이하여야 합니다."))
    .optional(),

  // 경력년수: 숫자
  yearsOfExperience: z.number().optional(),

  // 가능한 시간: 문자열 배열
  availableTimes: z.array(z.string()).optional(),
});

export type UpdateTeacherProfileFormData = z.infer<
  typeof updateTeacherProfileSchema
>;
