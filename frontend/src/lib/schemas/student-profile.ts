import { z } from "zod";

/**
 * 학생 프로필 업데이트 스키마
 * 백엔드 UpdateProfileDto와 동일한 validation 규칙
 */
export const updateStudentProfileSchema = z.object({
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

  // 비상연락처: 01X-XXXX-XXXX 형식
  emergencyContact: z
    .string()
    .regex(
      /^01[0-9]-[0-9]{4}-[0-9]{4}$/,
      "비상연락처는 01X-XXXX-XXXX 형식이어야 합니다."
    )
    .optional()
    .or(z.literal("")),

  // 생년월일: ISO 날짜 형식
  birthDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "생년월일은 유효한 날짜 형식이어야 합니다." }
    )
    .optional()
    .or(z.literal("")),

  // 특이사항: 500자 이하
  notes: z
    .string()
    .max(500, "특이사항은 500자 이하여야 합니다.")
    .optional()
    .or(z.literal("")),

  // 레벨: 20자 이하, 한글/영문/공백만 허용
  level: z
    .string()
    .max(20, "레벨은 20자 이하여야 합니다.")
    .regex(/^[가-힣a-zA-Z\s]+$/, "레벨은 한글, 영문, 공백만 사용 가능합니다.")
    .optional()
    .or(z.literal("")),
});

export type UpdateStudentProfileFormData = z.infer<
  typeof updateStudentProfileSchema
>;
