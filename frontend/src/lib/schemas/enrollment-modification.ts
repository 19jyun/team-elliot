import { z } from "zod";
import { RefundReason } from "@/utils/refundRequestValidation";

// [Step 1] 날짜 선택 (세션 변경)
export const modificationDateSchema = z.object({
  selectedSessionIds: z.array(z.number()).refine(() => true),
});
// [Step 2-A] 추가 결제
export const modificationPaymentSchema = z.object({
  confirmed: z.boolean().refine((val) => val === true, {
    message: "입금 확인에 동의해주세요.",
  }),
});

// [Step 2-B] 환불 신청
export const refundRequestSchema = z
  .object({
    bank: z.string().min(1, "은행을 선택해주세요."),
    customBankName: z.string().optional(),
    accountNumber: z
      .string()
      .regex(/^[0-9]+$/, "계좌번호는 숫자만 입력해주세요.")
      .min(8, "계좌번호는 최소 8자리 이상이어야 합니다.")
      .max(16, "계좌번호는 최대 16자리까지 입력 가능합니다."),
    accountHolder: z.string().min(2, "예금주는 2글자 이상이어야 합니다."),
    reason: z
      .nativeEnum(RefundReason)
      .refine((val) => Object.values(RefundReason).includes(val), {
        message: "환불 사유를 선택해주세요.",
      }),
    detailedReason: z.string().optional(),
    saveAccount: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.bank === "기타" &&
      (!data.customBankName || data.customBankName.trim().length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "은행명을 입력해주세요.",
        path: ["customBankName"],
      });
    }

    if (
      data.reason === RefundReason.OTHER &&
      (!data.detailedReason || data.detailedReason.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "상세 사유를 입력해주세요.",
        path: ["detailedReason"],
      });
    }
  });

export type ModificationDateSchemaType = z.infer<typeof modificationDateSchema>;
export type ModificationPaymentSchemaType = z.infer<
  typeof modificationPaymentSchema
>;
export type RefundRequestSchemaType = z.infer<typeof refundRequestSchema>;
