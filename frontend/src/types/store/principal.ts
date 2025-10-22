// Principal 전용 Redux 타입들 (실시간 업데이트가 필요한 데이터만)
import type { SessionEnrollment } from "./common";
import type { RefundRequestResponse } from "@/types/api/refund";
import type { PrincipalClassSession } from "@/types/api/principal";

// Principal Redux 상태 (실시간 업데이트가 필요한 데이터만)
interface PrincipalData {
  enrollments: SessionEnrollment[];
  refundRequests: RefundRequestResponse[];
  calendarSessions: PrincipalClassSession[]; // 캘린더 세션 데이터 추가
  calendarRange: {
    startDate: string;
    endDate: string;
  } | null; // 캘린더 범위 추가
}

// Principal Redux 상태 타입
export interface PrincipalState {
  data: PrincipalData | null;
  isLoading: boolean;
  error: string | null;
}
