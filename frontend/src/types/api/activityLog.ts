export interface ActivityLog {
  id: number;
  userId: number;
  userRole: string;
  action: string;
  entityType?: string;
  entityId?: number;
  description: string;
  level: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
  oldValue?: any;
  newValue?: any;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityStatistics {
  categoryStats: Array<{
    action: string;
    _count: { action: number };
  }>;
  statusStats: Array<{
    level: string;
    _count: { level: number };
  }>;
  monthlyStats: Array<{
    month: string;
    count: number;
    action: string;
  }>;
}

export interface AdminDashboardData {
  totalActivities: number;
  userStats: Array<{
    userId: number;
    userRole: string;
    _count: { userId: number };
  }>;
  actionStats: Array<{
    action: string;
    _count: { action: number };
  }>;
  recentActivities: ActivityLog[];
}

export interface QueryActivityLogParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  action?: string;
  level?: string;
  userRole?: string;
}

// 수강 신청 내역 전용 타입
export interface EnrollmentHistoryItem extends ActivityLog {}

export interface EnrollmentHistoryResponse {
  logs: EnrollmentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 활동 타입 상수 (백엔드와 동일)
export const ACTIVITY_TYPES = {
  ENROLLMENT: {
    ENROLL_SESSION: "ENROLL_SESSION",
    BATCH_ENROLL_SESSIONS: "BATCH_ENROLL_SESSIONS",
    CANCEL_ENROLLMENT: "CANCEL_ENROLLMENT",
    CHANGE_SCHEDULE: "CHANGE_SCHEDULE",
    APPROVE_ENROLLMENT: "APPROVE_ENROLLMENT",
    REJECT_ENROLLMENT: "REJECT_ENROLLMENT",
  },
  PAYMENT: {
    PAYMENT_ATTEMPT: "PAYMENT_ATTEMPT",
    PAYMENT_COMPLETED: "PAYMENT_COMPLETED",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    PAYMENT_CANCELLED: "PAYMENT_CANCELLED",
    REFUND_REQUEST: "REFUND_REQUEST",
    REFUND_COMPLETED: "REFUND_COMPLETED",
    REFUND_REJECTED: "REFUND_REJECTED",
    PARTIAL_REFUND: "PARTIAL_REFUND",
  },
  ATTENDANCE: {
    ATTENDANCE_CHECK: "ATTENDANCE_CHECK",
    ATTENDANCE_UPDATE: "ATTENDANCE_UPDATE",
    LATE_ATTENDANCE: "LATE_ATTENDANCE",
    ABSENT_ATTENDANCE: "ABSENT_ATTENDANCE",
  },
  ACCOUNT: {
    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",
    SIGNUP: "SIGNUP",
    PROFILE_UPDATE: "PROFILE_UPDATE",
    PASSWORD_CHANGE: "PASSWORD_CHANGE",
    ACCOUNT_DELETION: "ACCOUNT_DELETION",
  },
  CLASS: {
    CLASS_CREATE: "CLASS_CREATE",
    CLASS_UPDATE: "CLASS_UPDATE",
    CLASS_DELETE: "CLASS_DELETE",
    CLASS_STATUS_CHANGE: "CLASS_STATUS_CHANGE",
  },
  ACADEMY: {
    ACADEMY_JOIN: "ACADEMY_JOIN",
    ACADEMY_LEAVE: "ACADEMY_LEAVE",
    ACADEMY_UPDATE: "ACADEMY_UPDATE",
  },
  ADMIN: {
    ROLE_CHANGE: "ROLE_CHANGE",
    SYSTEM_CONFIG_CHANGE: "SYSTEM_CONFIG_CHANGE",
    NOTICE_CREATE: "NOTICE_CREATE",
    NOTICE_UPDATE: "NOTICE_UPDATE",
    NOTICE_DELETE: "NOTICE_DELETE",
  },
} as const;
