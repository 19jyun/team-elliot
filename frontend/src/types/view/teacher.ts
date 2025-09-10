// Teacher 화면 전용 ViewModel 타입들
import type { EnrollmentStatus, SessionCore, TeacherRef } from "../api/common";

// ============= 기본 ViewModel 인터페이스 =============

export interface BaseVM {
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
}

// ============= 클래스 관련 ViewModel들 =============

// 클래스 상세 정보 ViewModel
export interface TeacherClassDetailVM extends BaseVM {
  isEditing: boolean;
  displayData: {
    className: string;
    levelText: string;
    dayOfWeekText: string;
    timeRange: string;
    studentCount: string;
    tuitionFee: string;
    description?: string;
  };
  editData: {
    description: string;
    locationName: string;
    mapImageUrl: string;
    requiredItems: string[];
    curriculum: string[];
  };
}

// 세션 카드 ViewModel
export interface TeacherSessionCardVM extends SessionCore {
  class: {
    id: number;
    className: string;
    maxStudents: number;
    level: string;
    teacher: TeacherRef;
  };
  enrollmentCount: number;
  confirmedCount: number;
  // UI 표시용 계산된 필드들
  displayDate: string;
  displayTime: string;
  displayCapacity: string;
  levelColor: string;
  isFull: boolean;
}

// ============= 세션 상세 관련 ViewModel들 =============

// 수강생 표시 ViewModel (확장)
export interface SessionEnrollmentDisplayVM {
  id: number;
  studentId: number;
  sessionId: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
    level?: string; // level 속성 추가
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    paidAt?: string;
  };
  refundRequests?: Array<{
    id: number;
    reason: string;
    refundAmount: number;
    status: string;
    requestedAt: string;
  }>;
  // UI 표시용 계산된 필드들
  displayStatus: string;
  statusColor: string;
  displayEnrolledAt: string;
  hasPayment: boolean;
  hasRefundRequests: boolean;
}

// ============= 대시보드 관련 ViewModel들 =============

// Teacher 캘린더 세션 ViewModel
export interface TeacherCalendarSessionVM extends SessionCore {
  class: {
    id: number;
    className: string;
    maxStudents: number;
    level: string;
    teacher: TeacherRef;
  };
  enrollmentCount: number;
  confirmedCount: number;
  // UI 표시용 계산된 필드들
  displayDate: string;
  displayTime: string;
  displayCapacity: string;
  levelColor: string;
  isFull: boolean;
  canManage: boolean; // 선생님이 관리할 수 있는지 여부
}

// Teacher 클래스 리스트 ViewModel
export interface TeacherClassListVM extends BaseVM {
  classes: TeacherClassCardVM[];
  hasClasses: boolean;
  totalClasses: number;
}

// Teacher 클래스 카드 ViewModel
export interface TeacherClassCardVM {
  id: number;
  className: string;
  level: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  currentStudents: number;
  tuitionFee: number;
  description?: string;
  // UI 표시용 계산된 필드들
  displayLevel: string;
  displayDayOfWeek: string;
  displayTimeRange: string;
  displayStudentCount: string;
  displayTuitionFee: string;
  levelColor: string;
  isFull: boolean;
  canManage: boolean;
}

// ============= 모달 관련 ViewModel들 =============

// Teacher 세션 상세 모달 ViewModel
export interface TeacherSessionDetailModalVM {
  isOpen: boolean;
  session: TeacherCalendarSessionVM | null;
  onClose: () => void;
}

// Teacher 클래스 세션 모달 ViewModel
export interface TeacherClassSessionModalVM {
  isOpen: boolean;
  selectedClass: TeacherClassCardVM | null;
  onClose: () => void;
}
