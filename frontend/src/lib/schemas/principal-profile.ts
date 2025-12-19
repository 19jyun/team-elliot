import { z } from "zod";

/**
 * 원장 프로필 업데이트 스키마
 * 백엔드 UpdateProfileDto(Principal)와 동일한 validation 규칙
 */
export const updatePrincipalProfileSchema = z.object({
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

  // 자격증: 배열, 각 항목 200자 이하
  certifications: z
    .array(z.string().max(200, "각 자격증 항목은 200자 이하여야 합니다."))
    .optional(),

  // 은행명: 50자 이하, 한글/영문/공백만 허용
  bankName: z
    .string()
    .max(50, "은행명은 50자 이하여야 합니다.")
    .regex(/^[가-힣a-zA-Z\s]+$/, "은행명은 한글, 영문, 공백만 사용 가능합니다.")
    .optional()
    .or(z.literal("")),

  // 계좌번호: 20자 이하, 숫자와 하이픈만 허용
  accountNumber: z
    .string()
    .max(20, "계좌번호는 20자 이하여야 합니다.")
    .regex(/^[0-9-]+$/, "계좌번호는 숫자와 하이픈만 사용 가능합니다.")
    .optional()
    .or(z.literal("")),

  // 예금주: 50자 이하, 한글/영문/공백만 허용
  accountHolder: z
    .string()
    .max(50, "예금주는 50자 이하여야 합니다.")
    .regex(/^[가-힣a-zA-Z\s]+$/, "예금주는 한글, 영문, 공백만 사용 가능합니다.")
    .optional()
    .or(z.literal("")),
});

export type UpdatePrincipalProfileFormData = z.infer<
  typeof updatePrincipalProfileSchema
>;
