export interface StudentClass {
  id: number;
  name: string;
  teacherName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  [key: string]: any;
}

export interface MyClassesResponse {
  enrollmentClasses: StudentClass[];
  sessionClasses: StudentClass[];
}
export interface ClassDetailResponse extends StudentClass {}
export interface EnrollClassResponse {
  success: boolean;
  message: string;
}
export interface UnenrollClassResponse {
  success: boolean;
  message: string;
}

// 학생 개인 정보 타입
export interface StudentProfile {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string | null;
  emergencyContact: string | null;
  birthDate: string | null;
  notes: string | null;
  level: string | null;
  createdAt: string;
  updatedAt: string;
}

// 개인 정보 수정 요청 타입
export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  birthDate?: string;
  notes?: string;
  level?: string;
}
