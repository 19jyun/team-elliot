import { useMemo } from "react";
import {
  calculateEnrollmentChange,
  getEnrollmentChangeSummary,
  getEnrollmentChangeDetails,
  type EnrollmentChange,
  type SessionInfo,
} from "@/utils/enrollmentCalculation";

interface UseEnrollmentCalculationProps {
  originalEnrollments: SessionInfo[];
  selectedSessionIds: Set<number>;
  sessionPrice: number;
}

interface UseEnrollmentCalculationReturn {
  change: EnrollmentChange;
  summary: string;
  details: ReturnType<typeof getEnrollmentChangeDetails>;
  isAdditionalPayment: boolean;
  isRefund: boolean;
  isNoChange: boolean;
}

/**
 * 수강 변경 금액 계산 훅
 */
export function useEnrollmentCalculation({
  originalEnrollments,
  selectedSessionIds,
  sessionPrice,
}: UseEnrollmentCalculationProps): UseEnrollmentCalculationReturn {
  const change = useMemo(() => {
    return calculateEnrollmentChange(
      originalEnrollments,
      selectedSessionIds,
      sessionPrice
    );
  }, [originalEnrollments, selectedSessionIds, sessionPrice]);

  const summary = useMemo(() => {
    return getEnrollmentChangeSummary(change);
  }, [change]);

  const details = useMemo(() => {
    return getEnrollmentChangeDetails(change);
  }, [change]);

  const isAdditionalPayment = change.type === "additional_payment";
  const isRefund = change.type === "refund";
  const isNoChange = change.type === "no_change";

  return {
    change,
    summary,
    details,
    isAdditionalPayment,
    isRefund,
    isNoChange,
  };
}
