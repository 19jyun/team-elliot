// Principal 전용 ViewModel 타입들

// Base ViewModel 인터페이스
export interface BaseVM {
  isLoading: boolean;
  error: string | null;
}
import type {
  PrincipalProfile,
  PrincipalAcademy,
  PrincipalClass,
  PrincipalTeacher,
  PrincipalStudent,
  PrincipalClassSession,
  PrincipalEnrollment,
  UpdatePrincipalProfileRequest,
} from "@/types/api/principal";
import type { RefundRequestResponse } from "@/types/api/refund";

// ============= 공통 ViewModel 베이스 =============

// Principal 캘린더 세션 ViewModel
export interface PrincipalCalendarSessionVM extends PrincipalClassSession {
  // UI 표시용 계산된 필드들
  displayDate: string;
  displayTime: string;
  displayCapacity: string;
  levelColor: string;
  isFull: boolean;
  canManage: boolean;
}

// Principal 클래스 카드 ViewModel
export interface PrincipalClassCardVM extends PrincipalClass {
  // UI 표시용 계산된 필드들
  displaySchedule: string;
  displayCapacity: string;
  levelColor: string;
  isRegistrationOpen: boolean;
  canManage: boolean;
}

// Principal 클래스 목록 ViewModel
export interface PrincipalClassListVM extends BaseVM {
  classes: PrincipalClassCardVM[];
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

// Principal 선생님 카드 ViewModel
export interface PrincipalTeacherCardVM extends PrincipalTeacher {
  // UI 표시용 계산된 필드들
  displayJoinedAt: string;
  displayExperience: string;
  statusColor: string;
  canManage: boolean;
}

// Principal 선생님 목록 ViewModel
export interface PrincipalTeacherListVM extends BaseVM {
  teachers: PrincipalTeacherCardVM[];
  totalCount: number;
  activeCount: number;
}

// Principal 수강생 카드 ViewModel
export interface PrincipalStudentCardVM extends PrincipalStudent {
  // UI 표시용 계산된 필드들
  displayJoinedAt: string;
  displayLevel: string;
  statusColor: string;
  canManage: boolean;
}

// Principal 수강생 목록 ViewModel
export interface PrincipalStudentListVM extends BaseVM {
  students: PrincipalStudentCardVM[];
  totalCount: number;
  activeCount: number;
}

// ============= 세션 상세 관련 ViewModel들 =============

// Principal 세션 상세 모달 ViewModel
export interface PrincipalSessionDetailModalVM {
  isOpen: boolean;
  session: PrincipalCalendarSessionVM | null;
  onClose: () => void;
}

// Principal 클래스 세션 모달 ViewModel
export interface PrincipalClassSessionModalVM {
  isOpen: boolean;
  selectedClass: PrincipalClassCardVM | null;
  onClose: () => void;
}

// ============= 학원 관리 관련 ViewModel들 =============

// Principal 학원 정보 ViewModel
export interface PrincipalAcademyVM extends PrincipalAcademy {
  // UI 표시용 계산된 필드들
  displayCreatedAt: string;
  displayUpdatedAt: string;
  canEdit: boolean;
}

// Principal 프로필 ViewModel
export interface PrincipalProfileVM extends PrincipalProfile {
  // UI 표시용 계산된 필드들
  displayJoinedAt: string;
  canEdit: boolean;
}

// ============= 수강신청/환불 관리 관련 ViewModel들 =============

// Principal 수강신청 요청 ViewModel
export interface PrincipalEnrollmentRequestVM {
  id: number;
  studentId: number;
  studentName: string;
  studentPhoneNumber?: string;
  status: string;
  enrolledAt: string;
  reason?: string;
  // 세션 정보
  sessionDate?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  className?: string;
  classLevel?: string;
  teacherName?: string;
  // UI 표시용 계산된 필드들
  displayEnrolledAt: string;
  displaySessionDate?: string;
  displaySessionTime?: string;
  statusColor: string;
  canApprove: boolean;
  canReject: boolean;
}

// Principal 환불 요청 ViewModel
export interface PrincipalRefundRequestVM {
  id: number;
  studentId: number;
  studentName: string;
  studentPhoneNumber?: string;
  reason: string;
  detailedReason?: string;
  refundAmount: number;
  status: string;
  requestedAt: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  // 세션 정보
  sessionDate?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  className?: string;
  classLevel?: string;
  teacherName?: string;
  // UI 표시용 계산된 필드들
  displayRequestedAt: string;
  displayRefundAmount: string;
  displaySessionDate?: string;
  displaySessionTime?: string;
  statusColor: string;
  canApprove: boolean;
  canReject: boolean;
}

// Principal 세션별 요청 목록 ViewModel
export interface PrincipalSessionWithRequestsVM {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  class: {
    id: number;
    className: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  pendingCount: number;
  // UI 표시용 계산된 필드들
  displayDate: string;
  displayTime: string;
  displayPendingCount: string;
  canManage: boolean;
}

// ============= 대시보드 관련 ViewModel들 =============

// Principal 대시보드 통계 ViewModel
export interface PrincipalDashboardStatsVM {
  totalClasses: number;
  totalTeachers: number;
  totalStudents: number;
  totalSessions: number;
  activeClasses: number;
  pendingEnrollments: number;
  pendingRefunds: number;
  // UI 표시용 계산된 필드들
  displayStats: {
    classes: string;
    teachers: string;
    students: string;
    sessions: string;
  };
  statusColors: {
    active: string;
    pending: string;
    completed: string;
  };
}

// Principal 대시보드 메인 ViewModel
export interface PrincipalDashboardVM extends BaseVM {
  profile: PrincipalProfileVM | null;
  academy: PrincipalAcademyVM | null;
  stats: PrincipalDashboardStatsVM;
  recentSessions: PrincipalCalendarSessionVM[];
  recentRequests: PrincipalSessionWithRequestsVM[];
}

// ============= 클래스 생성 관련 ViewModel들 =============

// Principal 클래스 생성 폼 ViewModel
export interface PrincipalCreateClassFormVM {
  name: string;
  description: string;
  level: string;
  maxStudents: number;
  price: number;
  content: string;
  schedule: {
    startDate: string;
    endDate: string;
    days: string[];
    startTime: string;
    endTime: string;
  };
  selectedTeacherId: number | null;
  // UI 표시용 계산된 필드들
  isValid: boolean;
  validationErrors: string[];
  canSubmit: boolean;
}

// Principal 클래스 생성 단계 ViewModel
export interface PrincipalCreateClassStepVM {
  currentStep: "info" | "schedule" | "teacher" | "content" | "complete";
  totalSteps: number;
  canGoNext: boolean;
  canGoBack: boolean;
  stepTitle: string;
  stepDescription: string;
}

// ============= 프로필 관리 관련 ViewModel들 =============

// Principal 프로필 편집 ViewModel
export interface PrincipalProfileEditVM {
  isEditing: boolean;
  formData: {
    name: string;
    phoneNumber: string;
    introduction: string;
    education: string[];
    certifications: string[];
  };
  // UI 표시용 계산된 필드들
  hasChanges: boolean;
  canSave: boolean;
  validationErrors: string[];
}

// Principal 은행 정보 ViewModel
export interface PrincipalBankInfoVM {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  // UI 표시용 계산된 필드들
  displayAccountNumber: string;
  canEdit: boolean;
}

// ============= 수강생 관리 관련 ViewModel들 =============

// Principal 수강생 세션 히스토리 ViewModel
export interface PrincipalStudentSessionHistoryVM {
  studentId: number;
  studentName: string;
  sessions: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    class: {
      id: number;
      className: string;
      teacher: {
        id: number;
        name: string;
      };
    };
    enrollmentStatus: string;
    enrolledAt: string;
    // UI 표시용 계산된 필드들
    displayDate: string;
    displayTime: string;
    statusColor: string;
  }>;
  // UI 표시용 계산된 필드들
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  displayStats: {
    total: string;
    completed: string;
    pending: string;
  };
}

// ============= 모달 관련 ViewModel들 =============

// Principal 거절 폼 모달 ViewModel
export interface PrincipalRejectionFormModalVM {
  isOpen: boolean;
  requestType: "enrollment" | "refund";
  requestId: number;
  onClose: () => void;
  onSubmit: (reason: string, detailedReason?: string) => void;
}

// Principal 날짜 세션 모달 ViewModel
export interface PrincipalDateSessionModalVM {
  isOpen: boolean;
  selectedDate: Date | null;
  sessions: PrincipalCalendarSessionVM[];
  onClose: () => void;
  onSessionClick: (session: PrincipalCalendarSessionVM) => void;
}

// ============= 추가 필요한 ViewModel들 =============

// Principal 요청 카드 Props ViewModel (PrincipalRequestCard용)
export interface PrincipalRequestCardVM {
  request: PrincipalEnrollmentRequestVM | PrincipalRefundRequestVM;
  requestType: "enrollment" | "refund";
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isProcessing?: boolean;
}

// Principal 프로필 카드 Props ViewModel (PrincipalProfileCard용)
export interface PrincipalProfileCardVM {
  principalId?: number;
  isEditable?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
  compact?: boolean;
}

// Principal 클래스 생성 컨테이너 ViewModel (CreateClassContainer용)
export interface PrincipalCreateClassContainerVM {
  currentStep: "info" | "schedule" | "teacher" | "content" | "complete";
  onStepChange: (step: string) => void;
}

// Principal 수강신청/환불 관리 컨테이너 ViewModel (EnrollmentRefundManagementContainer용)
export interface PrincipalEnrollmentRefundContainerVM {
  currentStep: "class-list" | "session-list" | "request-detail";
  selectedSessionId: number | null;
  onStepChange: (step: string) => void;
  onSessionSelect: (sessionId: number) => void;
}

// Principal 세션 상세 모달 Props ViewModel (SessionDetailModal용)
export interface PrincipalSessionDetailModalPropsVM {
  isOpen: boolean;
  sessionId: number | null;
  onClose: () => void;
  role: "principal";
}

// Principal 날짜 세션 모달 Props ViewModel (DateSessionModal용)
export interface PrincipalDateSessionModalPropsVM {
  isOpen: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSessionClick: (session: PrincipalCalendarSessionVM) => void;
  role: "principal";
}

// Principal 요청 상세 ViewModel
export interface PrincipalRequestDetailVM {
  requests: (PrincipalEnrollment | RefundRequestResponse)[];
  selectedTab: "enrollment" | "refund";
  selectedSessionId: number | null;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  showRejectionModal: boolean;
  selectedRequest: { id: number } | null;
  // UI 표시용 계산된 필드들
  hasRequests: boolean;
  requestCount: number;
  emptyMessage: string;
}

// Principal 개인정보 관리 ViewModel
export interface PrincipalPersonalInfoManagementVM {
  profile: PrincipalProfile | null;
  isEditing: boolean;
  editedInfo: UpdatePrincipalProfileRequest;
  isLoading: boolean;
  error: string | null;
  isPrincipal: boolean;
  // 전화번호 인증 관련
  isPhoneVerificationRequired: boolean;
  isPhoneVerified: boolean;
  verificationCode: string;
  timeLeft: number;
  isTimerRunning: boolean;
  // Validation 관련
  validationErrors: Record<string, string>;
  isShaking: boolean;
  // UI 표시용 계산된 필드들
  isInitialLoading: boolean;
  canSave: boolean;
  phoneDisplayValue: string;
  academyDisplayValue: string;
}

// Principal 클래스 목록 ViewModel (수강신청/환불 관리용)
export interface PrincipalClassListForRequestsVM {
  classes: PrincipalClassData[];
  selectedTab: "enrollment" | "refund";
  isLoading: boolean;
  error: string | null;
  // UI 표시용 계산된 필드들
  hasClasses: boolean;
  emptyMessage: string;
}

// Principal 클래스 데이터 (내부 사용)
export interface PrincipalClassData {
  id: number;
  name: string;
  pendingCount: number;
  sessions: (PrincipalEnrollment | RefundRequestResponse)[];
  teacherName: string;
  level: string;
}

// Principal 세션 목록 ViewModel (수강신청/환불 관리용)
export interface PrincipalSessionListForRequestsVM {
  sessions: PrincipalSessionData[];
  selectedTab: "enrollment" | "refund";
  selectedClassId: number | null;
  isLoading: boolean;
  error: string | null;
  // UI 표시용 계산된 필드들
  hasSessions: boolean;
  emptyMessage: string;
  showClassSelectionMessage: boolean;
}

// Principal 세션 데이터 (내부 사용)
export interface PrincipalSessionData {
  sessionId: number;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  level: string;
  teacherName: string;
  currentStudents: number;
  maxStudents: number;
  pendingCount: number;
  enrollments?: PrincipalEnrollment[];
  refundRequests?: RefundRequestResponse[];
}

// Principal 학생 세션 히스토리 모달 ViewModel
export interface PrincipalStudentSessionHistoryModalVM {
  student: {
    id: number;
    name: string;
  };
  history: PrincipalStudentSessionHistoryItem[];
  isLoading: boolean;
  error: string | null;
  // UI 표시용 계산된 필드들
  hasHistory: boolean;
  emptyMessage: string;
}

// Principal 학생 세션 히스토리 아이템
export interface PrincipalStudentSessionHistoryItem {
  id: number;
  status: string;
  enrolledAt: string;
  session: {
    date: string;
    class: {
      className: string;
    };
  };
}
