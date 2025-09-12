// 공통 타입 정의
import { EnrollmentStatus } from "@/types/api/common";

export type UserRole = "STUDENT" | "TEACHER" | "PRINCIPAL";

export type FocusType = "dashboard" | "modal" | "subpage" | "overlay";

export type AuthMode = "login" | "signup";

// 네비게이션 관련 타입
export interface NavigationItem {
  label: string;
  href: string;
  index: number;
}

export interface NavigationHistoryItem {
  id: string;
  type: "subpage" | "step" | "tab" | "auth";
  name: string;
  data?: Record<string, unknown>;
  canGoBack: boolean;
  onGoBack: () => boolean;
}

// 폼 관련 타입
export type EnrollmentStep =
  | "main"
  | "academy-selection"
  | "class-selection"
  | "date-selection"
  | "payment"
  | "complete"
  | "refund-request"
  | "refund-complete";

export type CreateClassStep =
  | "info"
  | "teacher"
  | "schedule"
  | "content"
  | "complete";

export type SignupStep =
  | "role-selection"
  | "personal-info"
  | "account-info"
  | "terms";

export type PrincipalPersonManagementStep =
  | "class-list"
  | "session-list"
  | "request-detail";

// API 관련 타입 (기존 타입 재사용)
export interface ClassesWithSessionsByMonthResponse {
  id: number;
  name: string;
  description: string;
  level: string;
  maxStudents: number;
  price: number;
  academyId: number;
  sessions: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    currentStudents: number;
    maxStudents: number;
    isEnrollable: boolean;
    isFull: boolean;
    isPastStartTime: boolean;
    isAlreadyEnrolled: boolean;
    studentEnrollmentStatus: EnrollmentStatus | null;
  }[];
}

// EnrollmentStatus는 types/api/common.ts에서 가져옴

// 폼 상태 인터페이스
export interface EnrollmentForm {
  currentStep: EnrollmentStep;
  selectedMonth: number | null;
  selectedClasses: ClassesWithSessionsByMonthResponse[];
  selectedSessions: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    currentStudents: number;
    maxStudents: number;
    isEnrollable: boolean;
    isFull: boolean;
    isPastStartTime: boolean;
    isAlreadyEnrolled: boolean;
    studentEnrollmentStatus: EnrollmentStatus | null;
  }[];
  selectedClassIds: number[];
  selectedAcademyId: number | null;
  selectedClassesWithSessions: ClassesWithSessionsByMonthResponse[];
}

export interface CreateClassForm {
  currentStep: CreateClassStep;
  classFormData: {
    name: string;
    description: string;
    level: string;
    maxStudents: number;
    price: number;
    academyId?: number;
    schedule: {
      days: string[];
      startTime: string;
      endTime: string;
      startDate?: string;
      endDate?: string;
    };
    content: string;
  };
  selectedTeacherId: number | null;
}

export interface PrincipalCreateClassForm {
  currentStep: CreateClassStep;
  classFormData: {
    name: string;
    description: string;
    maxStudents: number;
    price: number;
    schedule: {
      days: string[];
      startTime: string;
      endTime: string;
      startDate: string;
      endDate: string;
    };
    content: string;
    academyId?: number;
  };
  selectedTeacherId: number | null;
}

export interface AuthForm {
  authMode: AuthMode;
  authSubPage: string | null;
  signup: {
    currentStep: SignupStep;
    role: "STUDENT" | "TEACHER" | null;
    personalInfo: {
      name: string;
      phoneNumber: string;
    };
    accountInfo: {
      userId: string;
      password: string;
      confirmPassword: string;
    };
    terms: {
      age: boolean;
      terms1: boolean;
      terms2: boolean;
      marketing: boolean;
    };
  };
  login: {
    userId: string;
    password: string;
  };
}

export interface PersonManagementForm {
  currentStep: PrincipalPersonManagementStep;
  selectedTab: "enrollment" | "refund";
  selectedClassId: number | null;
  selectedSessionId: number | null;
  selectedRequestId: number | null;
  selectedRequestType: "enrollment" | "refund" | null;
}

// UI 관련 타입
export interface ModalState {
  id: string;
  type: string;
  data?: Record<string, unknown>;
  onClose?: () => void;
}

export interface NotificationState {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export interface FocusState {
  current: FocusType;
  history: FocusType[];
}

// 데이터 관련 타입
export interface Class {
  id: number;
  name: string;
  description: string;
  level: string;
  maxStudents: number;
  price: number;
  academyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSession {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  currentStudents: number;
  maxStudents: number;
  isEnrollable: boolean;
  isFull: boolean;
  isPastStartTime: boolean;
  isAlreadyEnrolled: boolean;
  studentEnrollmentStatus: EnrollmentStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Academy {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

// 역할별 네비게이션 아이템
export const STUDENT_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "클래스 정보", href: "/dashboard", index: 0 },
  { label: "수강신청", href: "/dashboard", index: 1 },
  { label: "나의 정보", href: "/dashboard", index: 2 },
];

export const TEACHER_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "내 수업", href: "/dashboard", index: 0 },
  { label: "수업 관리", href: "/dashboard", index: 1 },
  { label: "나의 정보", href: "/dashboard", index: 2 },
];

export const PRINCIPAL_NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "강의 관리", href: "/dashboard", index: 0 },
  { label: "수강생/강사 관리", href: "/dashboard", index: 1 },
  { label: "학원 관리", href: "/dashboard", index: 2 },
  { label: "나의 정보", href: "/dashboard", index: 3 },
];
