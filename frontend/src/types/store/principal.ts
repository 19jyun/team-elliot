// Principal 전용 Redux 타입들 (실시간 업데이트가 필요한 데이터만)
import type { SessionEnrollment, RefundRequest } from "./common";

// Principal Redux 상태 (실시간 업데이트가 필요한 데이터만)
export interface PrincipalData {
  enrollments: SessionEnrollment[];
  refundRequests: RefundRequest[];
}

// Principal Redux 상태 타입
export interface PrincipalState {
  data: PrincipalData | null;
  isLoading: boolean;
  error: string | null;
}

// API 호출용 타입들 (Redux에 저장하지 않음)
export interface PrincipalProfile {
  id: number;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  introduction?: string;
  education?: string[];
  certifications?: string[];
  photoUrl?: string;
  academy?: {
    id: number;
    name: string;
  };
}

export interface Academy {
  id: number;
  name: string;
  phoneNumber: string;
  address: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: number;
  className: string;
  classCode: string;
  description: string;
  maxStudents: number;
  currentStudents: number;
  tuitionFee: number;
  teacherId: number;
  academyId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  level: string;
  status: string;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  teacher: {
    id: number;
    name: string;
    photoUrl: string;
  };
  academy: {
    id: number;
    name: string;
  };
  classSessions?: Session[];
}

export interface Session {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  currentStudents: number;
  maxStudents: number;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  introduction?: string;
  photoUrl?: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}
