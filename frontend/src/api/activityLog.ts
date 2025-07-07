import { apiClient } from "./apiClient";
import {
  ActivityLog,
  ActivityLogResponse,
  ActivityStatistics,
  AdminDashboardData,
  QueryActivityLogParams,
  EnrollmentHistoryItem,
  EnrollmentHistoryResponse,
  ACTIVITY_TYPES,
} from "@/types/api/activityLog";

// 활동 로그 API 클라이언트
export const activityLogApi = {
  // 전체 활동 히스토리 조회
  getActivityHistory: (
    params: QueryActivityLogParams = {}
  ): Promise<{ data: ActivityLogResponse }> => {
    return apiClient.get("/activity-logs", { params });
  },

  // 수강 신청 내역 조회
  getEnrollmentHistory: (
    params: QueryActivityLogParams = {}
  ): Promise<{ data: EnrollmentHistoryResponse }> => {
    return apiClient.get("/activity-logs/enrollment-history", { params });
  },

  // 결제 내역 조회
  getPaymentHistory: (
    params: QueryActivityLogParams = {}
  ): Promise<{ data: ActivityLogResponse }> => {
    return apiClient.get("/activity-logs/payment-history", { params });
  },

  // 환불/취소 내역 조회
  getRefundCancellationHistory: (
    params: QueryActivityLogParams = {}
  ): Promise<{ data: ActivityLogResponse }> => {
    return apiClient.get("/activity-logs/refund-cancellation-history", {
      params,
    });
  },

  // 출석 내역 조회
  getAttendanceHistory: (
    params: QueryActivityLogParams = {}
  ): Promise<{ data: ActivityLogResponse }> => {
    return apiClient.get("/activity-logs/attendance-history", { params });
  },

  // 카테고리별 활동 히스토리 조회
  getActivityHistoryByCategory: (
    category: string,
    params: QueryActivityLogParams = {}
  ): Promise<{ data: ActivityLogResponse }> => {
    return apiClient.get(`/activity-logs/category/${category}`, { params });
  },

  // 특정 세션의 활동 히스토리 조회
  getSessionActivityHistory: (
    sessionId: number,
    params: QueryActivityLogParams = {}
  ): Promise<{ data: ActivityLogResponse }> => {
    return apiClient.get(`/activity-logs/session/${sessionId}`, { params });
  },

  // 개인 활동 통계 조회
  getActivityStatistics: (
    startDate?: string,
    endDate?: string
  ): Promise<{ data: ActivityStatistics }> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get("/activity-logs/statistics", { params });
  },

  // 관리자 대시보드 데이터 조회
  getAdminDashboardData: (
    params: QueryActivityLogParams = {}
  ): Promise<{ data: AdminDashboardData }> => {
    return apiClient.get("/activity-logs/admin/dashboard", { params });
  },

  // 특정 활동 로그 조회
  getActivityLog: (id: number): Promise<{ data: ActivityLog }> => {
    return apiClient.get(`/activity-logs/${id}`);
  },
};

// 로그 레벨 상수
export const LOG_LEVELS = {
  CRITICAL: "CRITICAL",
  IMPORTANT: "IMPORTANT",
  NORMAL: "NORMAL",
  DEBUG: "DEBUG",
} as const;

// 활동 타입을 한국어로 변환하는 헬퍼 함수
export const getActivityTypeLabel = (action: string): string => {
  const labels: Record<string, string> = {
    [ACTIVITY_TYPES.ENROLLMENT.ENROLL_SESSION]: "수강 신청",
    [ACTIVITY_TYPES.ENROLLMENT.BATCH_ENROLL_SESSIONS]: "배치 수강 신청",
    [ACTIVITY_TYPES.ENROLLMENT.CANCEL_ENROLLMENT]: "수강 취소",
    [ACTIVITY_TYPES.ENROLLMENT.CHANGE_SCHEDULE]: "스케줄 변경",
    [ACTIVITY_TYPES.PAYMENT.PAYMENT_COMPLETED]: "결제 완료",
    [ACTIVITY_TYPES.PAYMENT.PAYMENT_FAILED]: "결제 실패",
    [ACTIVITY_TYPES.PAYMENT.REFUND_REQUEST]: "환불 요청",
    [ACTIVITY_TYPES.PAYMENT.REFUND_COMPLETED]: "환불 완료",
    [ACTIVITY_TYPES.ATTENDANCE.ATTENDANCE_CHECK]: "출석 체크",
    [ACTIVITY_TYPES.ATTENDANCE.LATE_ATTENDANCE]: "지각",
    [ACTIVITY_TYPES.ATTENDANCE.ABSENT_ATTENDANCE]: "결석",
    [ACTIVITY_TYPES.ACCOUNT.LOGIN]: "로그인",
    [ACTIVITY_TYPES.ACCOUNT.LOGOUT]: "로그아웃",
    [ACTIVITY_TYPES.ACADEMY.ACADEMY_JOIN]: "학원 가입",
    [ACTIVITY_TYPES.ACADEMY.ACADEMY_LEAVE]: "학원 탈퇴",
  };

  return labels[action] || action;
};

// 로그 레벨을 한국어로 변환하는 헬퍼 함수
export const getLogLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    [LOG_LEVELS.CRITICAL]: "긴급",
    [LOG_LEVELS.IMPORTANT]: "중요",
    [LOG_LEVELS.NORMAL]: "일반",
    [LOG_LEVELS.DEBUG]: "디버그",
  };

  return labels[level] || level;
};

// 로그 레벨에 따른 색상 반환
export const getLogLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    [LOG_LEVELS.CRITICAL]: "text-red-600",
    [LOG_LEVELS.IMPORTANT]: "text-orange-600",
    [LOG_LEVELS.NORMAL]: "text-blue-600",
    [LOG_LEVELS.DEBUG]: "text-gray-600",
  };

  return colors[level] || "text-gray-600";
};
