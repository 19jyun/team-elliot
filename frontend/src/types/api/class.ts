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
export interface CreateClassRequest extends Omit<Class, "id"> {}
export interface CreateClassResponse extends Class {}
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
