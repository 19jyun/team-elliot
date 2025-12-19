// src/lib/schemas/auth-signup.ts
import { z } from "zod";

// 1. 역할 선택 (Role Selection)
export const roleSchema = z.object({
  role: z.enum(["STUDENT", "TEACHER", "PRINCIPAL"], {
    message: "역할을 선택해주세요.",
  }),
});

// 2. 개인 정보 (Personal Info)
export const personalInfoSchema = z.object({
  name: z.string().min(2, "이름은 2글자 이상이어야 합니다."),
  phoneNumber: z
    .string()
    .regex(
      /^01[0-9]-\d{4}-\d{4}$/,
      "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)"
    ),
});

// 3. 계정 정보 (Account Info) - 비밀번호 확인 포함
export const accountInfoSchema = z
  .object({
    userId: z
      .string()
      .min(8, "아이디는 8자 이상이어야 합니다.")
      .max(15, "아이디는 15자 이하여야 합니다.")
      .regex(/^[A-Za-z0-9]+$/, "아이디는 영문과 숫자만 사용할 수 있습니다."),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .regex(/[a-zA-Z]/, "영문이 포함되어야 합니다.")
      .regex(/[0-9]/, "숫자가 포함되어야 합니다.")
      .regex(/^\S+$/, "공백 없이 입력해주세요."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], // 에러를 표시할 필드
  });

// 4. 학원 정보 (Academy Info) - Principal 전용
export const academyInfoSchema = z.object({
  name: z.string().min(1, "학원명을 입력해주세요."),
  phoneNumber: z
    .string()
    .regex(
      /^(0\d{1}-\d{4}-\d{4}|01[0-9]-\d{4}-\d{4})$/,
      "전화번호 형식이 올바르지 않습니다. (예: 02-1234-5678 또는 010-1234-5678)"
    ),
  address: z.string().min(1, "학원 주소를 입력해주세요."),
  description: z.string().min(1, "학원 소개를 입력해주세요."),
});

// 5. 약관 동의 (Terms)
export const termsSchema = z
  .object({
    age: z.boolean(),
    terms1: z.boolean(),
    terms2: z.boolean(),
    marketing: z.boolean().optional(), // 선택 사항
  })
  .refine((data) => data.age === true, {
    message: "만 14세 이상임에 동의해야 합니다.",
    path: ["age"],
  })
  .refine((data) => data.terms1 === true, {
    message: "서비스 이용약관에 동의해야 합니다.",
    path: ["terms1"],
  })
  .refine((data) => data.terms2 === true, {
    message: "개인정보 처리방침에 동의해야 합니다.",
    path: ["terms2"],
  });

// 타입 추출 (컴포넌트에서 사용)
export type RoleSchemaType = z.infer<typeof roleSchema>;
export type PersonalInfoSchemaType = z.infer<typeof personalInfoSchema>;
export type AccountInfoSchemaType = z.infer<typeof accountInfoSchema>;
export type AcademyInfoSchemaType = z.infer<typeof academyInfoSchema>;
export type TermsSchemaType = z.infer<typeof termsSchema>;
