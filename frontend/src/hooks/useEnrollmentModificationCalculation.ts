import { useMemo } from "react";
import type { ModificationSessionVM } from "@/types/view/student";
import type { ClassSessionForModification } from "@/types/api/class";

interface UseEnrollmentModificationCalculationProps {
  existingEnrollments: ModificationSessionVM[] | null | undefined;
  selectedSessionIds: Set<number>;
  modificationSessions: ClassSessionForModification[];
}

interface UseEnrollmentModificationCalculationReturn {
  // 계산 결과
  netChangeCount: number;
  totalAmount: number;
  changeType: "additional_payment" | "refund" | "no_change";

  // 상세 정보
  newlyAddedSessionsCount: number;
  newlyCancelledSessionsCount: number;
  newlyAddedSessionIds: number[];
  newlyCancelledSessionIds: number[];

  // 변경 여부
  hasChanges: boolean;
  hasRealChanges: boolean;

  // 세션 가격
  sessionPrice: number;

  // 다음 단계 결정
  nextStep: "payment" | "refund-request" | "complete" | "date-selection";
}

/**
 * 수강 변경 계산 훅
 * 기존 수강 신청과 새로 선택된 세션을 비교하여 변경 사항을 계산합니다.
 */
export function useEnrollmentModificationCalculation({
  existingEnrollments,
  selectedSessionIds,
  modificationSessions,
}: UseEnrollmentModificationCalculationProps): UseEnrollmentModificationCalculationReturn {
  const result = useMemo(() => {
    if (!existingEnrollments || existingEnrollments.length === 0) {
      // 기존 수강이 없는 경우
      const selectedCount = selectedSessionIds.size;
      const sessionPrice =
        modificationSessions.length > 0
          ? parseInt(modificationSessions[0].class?.tuitionFee || "50000")
          : 50000;

      return {
        netChangeCount: selectedCount,
        totalAmount: selectedCount * sessionPrice,
        changeType:
          selectedCount > 0
            ? ("additional_payment" as const)
            : ("no_change" as const),
        newlyAddedSessionsCount: selectedCount,
        newlyCancelledSessionsCount: 0,
        newlyAddedSessionIds: Array.from(selectedSessionIds),
        newlyCancelledSessionIds: [],
        hasChanges: selectedCount > 0,
        hasRealChanges: selectedCount > 0,
        sessionPrice,
        nextStep:
          selectedCount > 0 ? ("payment" as const) : ("complete" as const),
      };
    }

    // 기존에 신청된 세션들 (활성 상태인 것만: CONFIRMED, PENDING, REFUND_REJECTED_CONFIRMED)
    const originalEnrolledSessions = existingEnrollments.filter(
      (enrollment) =>
        enrollment.enrollment &&
        (enrollment.enrollment.status === "CONFIRMED" ||
          enrollment.enrollment.status === "PENDING" ||
          enrollment.enrollment.status === "REFUND_REJECTED_CONFIRMED")
    );

    // 기존 수강 세션의 ID들
    const originalSessionIds = new Set(
      originalEnrolledSessions.map((session) => session.id)
    );
    const selectedSessionIdsArray = Array.from(selectedSessionIds);

    // 새로 추가될 세션 수 (기존에 없던 세션들)
    const newlyAddedSessionIds = selectedSessionIdsArray.filter(
      (sessionId) => !originalSessionIds.has(sessionId)
    );
    const newlyAddedSessionsCount = newlyAddedSessionIds.length;

    // 새로 취소될 세션 수 (기존에 있던 세션들)
    const newlyCancelledSessionIds = Array.from(originalSessionIds).filter(
      (sessionId) => !selectedSessionIds.has(sessionId)
    );
    const newlyCancelledSessionsCount = newlyCancelledSessionIds.length;

    // 순 변경 세션 수 = 새로 추가 - 새로 취소
    const netChange = newlyAddedSessionsCount - newlyCancelledSessionsCount;

    // 실제 수강료 계산
    const sessionPrice =
      modificationSessions.length > 0
        ? parseInt(modificationSessions[0].class?.tuitionFee || "50000")
        : 50000;

    // 총 금액 계산
    const totalAmount = netChange * sessionPrice;

    // 변경 타입 결정
    let changeType: "additional_payment" | "refund" | "no_change";
    if (totalAmount > 0) {
      changeType = "additional_payment";
    } else if (totalAmount < 0) {
      changeType = "refund";
    } else {
      changeType = "no_change";
    }

    // 실제 변경 사항이 있는지 확인 (추가 또는 취소가 있는지)
    const hasChanges =
      newlyAddedSessionsCount > 0 || newlyCancelledSessionsCount > 0;

    // netChange가 0일 때 실제 세션 배열이 동일한지 확인
    let hasRealChanges = hasChanges;
    if (netChange === 0 && hasChanges) {
      // 길이 확인
      const sameLength = originalSessionIds.size === selectedSessionIds.size;

      // 모든 세션 ID가 동일한지 확인
      const sameSessions =
        sameLength &&
        Array.from(originalSessionIds).every((id) =>
          selectedSessionIds.has(id)
        ) &&
        selectedSessionIdsArray.every((id) => originalSessionIds.has(id));

      // 길이와 내용이 모두 동일하면 실제 변경 없음
      hasRealChanges = !sameSessions;
    }

    // 다음 단계 결정
    let nextStep: "payment" | "refund-request" | "complete" | "date-selection";
    if (changeType === "no_change") {
      if (hasChanges) {
        nextStep = "payment";
      } else {
        nextStep = "complete";
      }
    } else if (changeType === "additional_payment") {
      nextStep = "payment";
    } else if (changeType === "refund") {
      nextStep = "refund-request";
    } else {
      nextStep = "date-selection";
    }

    return {
      netChangeCount: netChange,
      totalAmount,
      changeType,
      newlyAddedSessionsCount,
      newlyCancelledSessionsCount,
      newlyAddedSessionIds,
      newlyCancelledSessionIds,
      hasChanges,
      hasRealChanges,
      sessionPrice,
      nextStep,
    };
  }, [existingEnrollments, selectedSessionIds, modificationSessions]);

  return result;
}
