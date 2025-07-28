// Principal 전용 API 타입들

// Principal의 학원 정보
export interface PrincipalAcademy {
  id: number;
  name: string;
  code: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

// Principal의 학원 세션 정보 (캘린더용)
export interface PrincipalSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  classId: number;
  class: {
    id: number;
    className: string;
    level: string;
    maxStudents: number;
    currentStudents: number;
    teacher: {
      id: number;
      name: string;
    };
  };
  enrollmentCount: number;
  confirmedCount: number;
}

// Principal의 학원 클래스 정보
export interface PrincipalClass {
  id: number;
  className: string;
  description?: string;
  level: string;
  maxStudents: number;
  currentStudents: number;
  tuitionFee: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  backgroundColor?: string;
  location?: string;
  teacher: {
    id: number;
    name: string;
    phoneNumber?: string;
  };
  isRegistrationOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

// Principal의 학원 선생님 정보
export interface PrincipalTeacher {
  id: number;
  name: string;
  phoneNumber?: string;
  introduction?: string;
  photoUrl?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  joinedAt: string;
  totalClasses: number;
  activeClasses: number;
}

// Principal의 학원 수강생 정보
export interface PrincipalStudent {
  id: number;
  name: string;
  phoneNumber?: string;
  emergencyContact?: string;
  birthDate?: string;
  notes?: string;
  level?: string;
  joinedAt?: string;
  totalSessions: number;
  confirmedSessions: number;
  pendingSessions: number;
  totalClasses: number;
  activeClasses: number;
}

// API 응답 타입들
export interface GetPrincipalAcademyResponse extends PrincipalAcademy {}
export interface GetPrincipalAllSessionsResponse
  extends Array<PrincipalSession> {}
export interface GetPrincipalAllClassesResponse extends Array<PrincipalClass> {}
export interface GetPrincipalAllTeachersResponse
  extends Array<PrincipalTeacher> {}
export interface GetPrincipalAllStudentsResponse
  extends Array<PrincipalStudent> {}
