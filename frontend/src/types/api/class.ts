export interface Class {
  id: number;
  name: string;
  description?: string;
  teacherId: number;
  dayOfWeek: string;
  startTime: string | Date;
  endTime: string | Date;
  maxStudents: number;
  level: string;
  location: string;
  monthlyFee: number;
  backgroundColor?: string;
  teacher?: {
    id: number;
    name: string;
    photoUrl?: string;
  };
  [key: string]: any;
}

export interface ClassSession {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  class?: {
    id: number;
    className: string;
    level: string;
    teacher?: {
      id: number;
      name: string;
    };
  };
  enrollments?: SessionEnrollment[];
}

export interface SessionEnrollment {
  id: number;
  studentId: number;
  sessionId: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  enrolledAt: string;
  cancelledAt?: string;
}

export interface ClassDetailsResponse extends Class {}
export interface AllClassesResponse extends Array<Class> {}
export interface CreateClassRequest {
  className: string;
  description: string;
  maxStudents: number;
  tuitionFee: number;
  teacherId: number;
  academyId: number;
  dayOfWeek: string;
  level: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  backgroundColor?: string;
}

export interface CreateClassResponse {
  id: number;
  className: string;
  classCode: string;
  description: string;
  maxStudents: number;
  currentStudents: number;
  tuitionFee: string;
  teacherId: number;
  academyId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  level: string;
  status: string;
  registrationMonth: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  backgroundColor: string | null;
  classDetailId: number | null;
  sessionCount: number;
  message: string;
}
export interface UpdateClassRequest extends Partial<Omit<Class, "id">> {}
export interface UpdateClassResponse extends Class {}
export interface EnrollClassRequest {
  studentId: number;
}
export interface EnrollClassResponse {
  success: boolean;
  message: string;
}
export interface UnenrollClassRequest {
  studentId: number;
}
export interface UnenrollClassResponse {
  success: boolean;
  message: string;
}
export interface ClassesByMonthResponse extends Array<Class> {}

// ClassSession 관련 타입들
export interface GetClassSessionsRequest {
  classId: number;
}

export interface GetClassSessionsResponse extends Array<ClassSession> {}

export interface BatchEnrollSessionsRequest {
  sessionIds: number[];
}

export interface BatchEnrollSessionsResponse {
  success: number;
  total: number;
  enrollments: SessionEnrollment[];
}

// 수강 변경/취소 관련 타입들
export interface StudentClassEnrollmentsResponse {
  classId: number;
  className: string;
  sessions: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    enrollment?: {
      id: number;
      status: "PENDING" | "CONFIRMED" | "CANCELLED";
      enrolledAt: string;
      cancelledAt?: string;
    };
  }>;
}

export interface ChangeEnrollmentRequest {
  newSessionId: number;
  reason?: string;
}

export interface BatchModifyEnrollmentsRequest {
  cancellations: number[];
  newEnrollments: number[];
  reason?: string;
}

export interface BatchModifyEnrollmentsResponse {
  success: boolean;
  cancelledCount: number;
  enrolledCount: number;
  message: string;
}
