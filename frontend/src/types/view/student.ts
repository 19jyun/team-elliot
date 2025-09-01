// Student 화면 전용 ViewModel 타입들
import type {
  SessionCore,
  ClassBase,
  ClassRef,
  TeacherRef,
  EnrollmentStatus,
  LevelType,
} from "../api/common";

// 캘린더에서 사용할 세션 ViewModel
export interface StudentCalendarSessionVM extends SessionCore {
  title: string; // "초급 발레 (김선생님)"
  timeDisplay: string; // "10:00-11:00"
  isFull: boolean;
  isEnrolled: boolean;
  canEnroll: boolean;
  statusColor: "green" | "blue" | "red" | "gray";
  capacityText: string; // "7/10명"
}

// 수강중인 클래스 카드 ViewModel
export interface StudentClassCardVM extends ClassBase {
  teacherName: string;
  schedule: string; // "월요일 10:00-11:00"
  sessionCount: number;
  nextSessionDate?: string; // "다음 수업: 1월 15일"
}

// 수강중인 클래스 리스트 Props용
export interface EnrolledClassVM extends Omit<ClassBase, "className"> {
  name: string; // 기존 코드 호환성을 위해 유지
  className?: string; // EnrolledClassCard에서 사용
  teacherName: string;
  teacher?: TeacherRef; // EnrolledClassCard에서 사용
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  sessions: StudentEnrolledSessionVM[];
}

// 세션 카드 ViewModel
export interface StudentSessionVM extends SessionCore {
  title: string; // 클래스명
  teacher: string;
  datetime: string; // "1월 15일 10:00-11:00"
  timeDisplay: string; // "10:00-11:00"
  status: "enrolled" | "available" | "full" | "past";
  statusText: string; // "수강중", "신청가능", "마감", "종료"
  statusColor: "green" | "blue" | "red" | "gray";
  canEnroll: boolean;
  canCancel: boolean;
  capacityText: string; // "7/10명"
}

// 세션 카드/리스트용 ViewModel (수강 내역 기반)
export type StudentEnrollmentCardStatus =
  | EnrollmentStatus
  | "CANCELLED"
  | "REFUND_REJECTED_CONFIRMED"
  | "REFUND_CANCELLED"
  | "TEACHER_CANCELLED";

export interface StudentEnrolledSessionVM extends Omit<SessionCore, "id"> {
  session_id: number;
  enrollment_id?: number;
  enrollment_status: StudentEnrollmentCardStatus;
  class: ClassRef & { level?: LevelType };
}

// ClassSessionModal Props용 (기존 컴포넌트 호환)
export interface ClassDataVM extends ClassRef {
  dayOfWeek: string;
  startTime: string;
  teacher: TeacherRef;
}

// SessionDetailModal Props용 (기존 컴포넌트 호환)
export interface SessionDataVM extends SessionCore {
  class: ClassBase & {
    teacher: TeacherRef;
  };
  isEnrolled: boolean;
  canEnroll: boolean;
}

// 캘린더 날짜 범위 ViewModel
export interface StudentCalendarRangeVM {
  startDate: Date;
  endDate: Date;
}

// 수강 신청용 클래스 ViewModel
export interface EnrollmentClassVM extends ClassBase {
  teacher: { name: string };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  backgroundColor?: string;
  sessionCount: number;
  academyId: number;
  availableSessions: Array<SessionCore>;
}

// Profile 관련 ViewModel들
export interface StudentAcademyVM {
  id: number;
  name: string;
  address?: string;
  description?: string;
  principalName?: string;
  phoneNumber?: string;
}

export interface StudentEnrollmentHistoryVM {
  id: number;
  sessionId: number;
  status: string;
  enrolledAt: string;
  description?: string;
  session: SessionCore & {
    class: ClassRef & {
      teacherName: string;
    };
  };
  enrollmentRejection?: {
    id: number;
    reason: string;
    detailedReason?: string;
    rejectedAt: string;
    rejector: TeacherRef;
  };
  refundRejection?: {
    id: number;
    reason: string;
    detailedReason?: string;
    rejectedAt: string;
    rejector: TeacherRef;
  };
  // 낙관적 업데이트용 플래그
  isOptimistic?: boolean;
}

export interface StudentCancellationHistoryVM {
  id: number;
  status: string;
  className: string;
  sessionDate: string;
  cancelledAt: string;
  reason?: string;
  sessionId?: number;
  refundAmount?: number;
  requestedAt?: string;
  rejectionDetail?: {
    id: number;
    reason: string;
    detailedReason?: string;
    rejectedAt: string;
    rejector: TeacherRef;
  };
  // 낙관적 업데이트용 플래그
  isOptimistic?: boolean;
}

// Enrollment Modification 관련 ViewModel들
export interface ModificationSessionVM extends SessionCore {
  class: ClassRef & { level?: string };
  enrollment?: {
    id: number;
    status: StudentEnrollmentCardStatus;
    enrolledAt: string;
    description?: string;
    refundRejection?: {
      id: number;
      reason: string;
      detailedReason?: string;
      rejectedAt: string;
      rejector: TeacherRef;
    };
  };
}

export interface ModificationExistingEnrollmentVM {
  id: number;
  status: string;
  enrolledAt: string;
  description?: string;
  refundRejection?: {
    id: number;
    reason: string;
    detailedReason?: string;
    rejectedAt: string;
    rejector: TeacherRef;
  };
  session: SessionCore & {
    class: ClassRef & {
      teacherName: string;
    };
  };
}

// ============= UI Props ViewModel들 =============

// Modal Props ViewModels
export interface StudentSessionDetailModalVM {
  isOpen: boolean;
  session: StudentEnrolledSessionVM | null;
  onClose: () => void;
  onlyDetail?: boolean;
}

export interface LeaveAcademyModalVM {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  academyName: string;
}

export interface ClassSessionModalVM {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassDataVM | null;
  classSessions: StudentEnrolledSessionVM[];
}

export interface ClassDetailModalVM {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
}

// Component Props ViewModels
export interface EnrolledClassCardVM extends EnrolledClassVM {
  onClick?: () => void;
}

export interface SessionCardVM {
  sessionId: number;
  title: string;
  teacher: string;
  datetime: string;
  status: "enrolled" | "available" | "full" | "past";
  statusText: string;
  statusColor: "green" | "blue" | "red" | "gray";
  onEnroll?: () => void;
  onCancel?: () => void;
  onClick?: () => void;
}

export interface SessionCardListVM {
  sessions: SessionCardVM[];
  onSessionClick?: (sessionId: number) => void;
}

export interface TeacherProfileCardForStudentVM {
  teacherId: number;
}

export interface TeacherProfileDisplayVM extends TeacherRef {
  phoneNumber?: string; // 기존 코드 호환성을 위해 유지
  introduction?: string;
  yearsOfExperience?: number;
  education?: string[];
  specialties?: string[];
  // UI 표시용 계산된 필드들
  displayName: string;
  displayPhotoUrl: string;
  displayPhoneNumber: string;
  displayIntroduction: string;
  displayYearsOfExperience: string;
  hasEducation: boolean;
  hasSpecialties: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ClassDetailVM {
  classId: number;
  classSessions?: StudentEnrolledSessionVM[];
  showModificationButton?: boolean;
  onModificationClick?: () => void;
}

export interface ClassDetailDisplayVM {
  classId: number;
  className: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  description: string;
  teacher: TeacherRef | null;
  hasTeacher: boolean;
  showModificationButton: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ClassDetailModalVM {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
}

// ============= SessionDetailTab ViewModel =============

export interface SessionDetailTabVM {
  sessionId: number;
}

export interface SessionDetailDisplayVM {
  sessionId: number;
  contents: SessionContentDisplayVM[];
  isLoading: boolean;
  error: string | null;
  hasContents: boolean;
}

export interface SessionContentDisplayVM {
  id: number;
  pose: {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    difficulty: string;
    // UI 표시용 계산된 필드들
    displayDifficulty: string;
    difficultyColor: string;
  };
  notes?: string;
  hasNotes: boolean;
  hasImage: boolean;
}

// Step Props ViewModels
export interface EnrollmentModificationDateStepVM {
  classId: number;
  existingEnrollments: ModificationSessionVM[];
  month?: number | null;
  onComplete: (selectedDates: string[], sessionPrice?: number) => void;
}

export interface EnrollmentModificationContainerVM {
  classId: number;
  className?: string;
  month?: number | null;
}

export interface EnrollmentPaymentStepVM {
  onComplete?: () => void;
}

export interface EnrollmentModificationPaymentStepVM {
  onComplete?: () => void;
}

export interface RefundRequestStepVM {
  refundAmount: number;
  onComplete?: () => void;
}

export interface RefundCompleteStepVM {
  isModification?: boolean;
}

export interface EnrollmentSubPageRendererVM {
  page: string;
}

// Payment Props ViewModels
export interface BankInfoVM {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface ClassFeeListVM {
  classes: Array<{
    id: number;
    name: string;
    fee: number;
    sessions: number;
  }>;
}

export interface TotalAmountVM {
  amount: number;
  currency?: string;
}

export interface PaymentToastVM {
  isVisible: boolean;
  message: string;
  type: "success" | "error" | "info";
}

export interface PaymentConfirmFooterVM {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface PrincipalPaymentBoxVM {
  principal: {
    name: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  amount: number;
}

export interface TeacherPaymentBoxVM {
  teacher: {
    name: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  amount: number;
}

// Other Props ViewModels
export interface DateSelectFooterVM {
  selectedCount: number;
  onNext: () => void;
  onCancel: () => void;
}

export interface StatusStepVM {
  steps: Array<{
    icon: string;
    label: string;
    isActive?: boolean;
    isCompleted?: boolean;
  }>;
  currentStep: number;
}

export interface RefundPolicyVM {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

// 선생님용: 수강생을 학원에서 제거
export interface RemoveStudentFromAcademyResponse {
  success: boolean;
  message: string;
}
