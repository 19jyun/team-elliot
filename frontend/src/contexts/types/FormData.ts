// src/contexts/types/FormData.ts
// 폼 데이터 타입 정의

export interface EnrollmentFormData {
  currentStep: string;
  selectedMonth: number | null;
  selectedClasses: unknown[];
  selectedSessions: unknown[];
  selectedClassIds: number[];
  selectedAcademyId: number | null;
  selectedClassesWithSessions: unknown[];
}

export interface ClassFormData {
  name: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  content: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
  };
  teacherId: number | null;
}

export interface AuthFormData {
  mode: "login" | "signup";
  subPage: string | null;
  signup: {
    step: string;
    role: "STUDENT" | "TEACHER" | null;
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      birthDate: string;
    };
    accountInfo: {
      username: string;
      password: string;
      confirmPassword: string;
    };
    terms: {
      privacy: boolean;
      service: boolean;
      marketing: boolean;
    };
  };
  login: {
    username: string;
    password: string;
    rememberMe: boolean;
  };
}

export interface PersonManagementFormData {
  currentStep: string;
  selectedTab: "enrollment" | "refund";
  selectedClassId: number | null;
  selectedSessionId: number | null;
  selectedRequestId: number | null;
  selectedRequestType: "enrollment" | "refund" | null;
}

// 통합 폼 데이터 타입
export type FormDataMap = {
  enrollment: EnrollmentFormData;
  createClass: ClassFormData;
  auth: AuthFormData;
  personManagement: PersonManagementFormData;
  principalCreateClass: ClassFormData;
  principalPersonManagement: PersonManagementFormData;
};

// HistoryItem은 NavigationTypes.ts에서 정의됨

// 이벤트 데이터 타입은 ContextEventBus.ts에서 정의됨
