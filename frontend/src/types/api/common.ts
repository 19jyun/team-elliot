// === 공통으로 사용되는 타입들 ===

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

// 결제 상태 타입
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";

// 수강신청 상태 타입
export type EnrollmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "REFUND_REQUESTED";

// 환불 상태 타입
export type RefundStatus = "REFUND_REQUESTED" | "APPROVED" | "REJECTED";
