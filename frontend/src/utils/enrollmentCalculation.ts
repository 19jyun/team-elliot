export interface EnrollmentChange {
  type: "additional_payment" | "refund" | "no_change";
  amount: number;
  newSessionsCount: number;
  cancelledSessionsCount: number;
  sessionPrice: number;
}

export interface SessionInfo {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  enrollment?: {
    id: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    enrolledAt: string;
    cancelledAt?: string;
  };
}

/**
 * 수강 변경 시 금액 계산
 * @param originalEnrollments - 기존 수강 신청 세션들
 * @param selectedDates - 현재 선택된 날짜들 (날짜 문자열 배열)
 * @param sessionPrice - 세션당 가격
 * @returns EnrollmentChange 객체
 */
export function calculateEnrollmentChange(
  originalEnrollments: SessionInfo[],
  selectedDates: string[],
  sessionPrice: number
): EnrollmentChange {
  // 기존에 신청된 세션들 (CONFIRMED 또는 PENDING 상태)
  const originalEnrolledSessions = originalEnrollments.filter(
    (enrollment) =>
      enrollment.enrollment &&
      (enrollment.enrollment.status === "CONFIRMED" ||
        enrollment.enrollment.status === "PENDING")
  );

  // 기존 신청 세션의 날짜들
  const originalDates = originalEnrolledSessions.map(
    (session) => new Date(session.date).toISOString().split("T")[0] // YYYY-MM-DD 형식
  );

  // 새로 선택된 세션 수
  const newSessionsCount = selectedDates.length;

  // 취소될 세션 수 (기존에 신청되었지만 현재 선택되지 않은 세션들)
  const cancelledSessionsCount = originalDates.filter(
    (date) => !selectedDates.includes(date)
  ).length;

  // 순 변경 세션 수
  const netChange =
    newSessionsCount -
    (originalEnrolledSessions.length - cancelledSessionsCount);

  // 총 금액 계산
  const totalAmount = netChange * sessionPrice;

  // 변경 타입 결정
  let type: EnrollmentChange["type"];
  if (totalAmount > 0) {
    type = "additional_payment";
  } else if (totalAmount < 0) {
    type = "refund";
  } else {
    type = "no_change";
  }

  return {
    type,
    amount: Math.abs(totalAmount), // 절댓값으로 반환
    newSessionsCount,
    cancelledSessionsCount,
    sessionPrice,
  };
}

/**
 * 수강 변경 요약 정보 생성
 * @param change - EnrollmentChange 객체
 * @returns 요약 문자열
 */
export function getEnrollmentChangeSummary(change: EnrollmentChange): string {
  switch (change.type) {
    case "additional_payment":
      return `추가 결제 필요: ${change.amount.toLocaleString()}원 (${
        change.newSessionsCount
      }개 세션 추가)`;
    case "refund":
      return `환불 예정: ${change.amount.toLocaleString()}원 (${
        change.cancelledSessionsCount
      }개 세션 취소)`;
    case "no_change":
      return "변경 사항 없음";
    default:
      return "계산 중...";
  }
}

/**
 * 수강 변경 상세 정보 생성
 * @param change - EnrollmentChange 객체
 * @returns 상세 정보 객체
 */
export function getEnrollmentChangeDetails(change: EnrollmentChange) {
  return {
    summary: getEnrollmentChangeSummary(change),
    breakdown: {
      newSessions: change.newSessionsCount,
      cancelledSessions: change.cancelledSessionsCount,
      sessionPrice: change.sessionPrice,
      totalAmount: change.amount,
    },
  };
}
