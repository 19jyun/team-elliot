export interface TeacherProfile {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  introduction?: string;
  specialization?: string;
  photoUrl?: string;
  [key: string]: any;
}

export interface TeacherProfileResponse extends TeacherProfile {}
export interface UpdateProfileRequest {
  introduction?: string;
  photo?: File;
}
export interface UpdateProfileResponse extends TeacherProfile {}
export interface TeacherClassesResponse
  extends Array<{
    id: number;
    className: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    maxStudents: number;
    currentStudents: number;
    level: string;
    tuitionFee: number;
    description?: string;
    backgroundColor?: string;
    location?: string;
    [key: string]: any;
  }> {}

// 새로운 타입들
export interface TeacherSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  class: {
    id: number;
    className: string;
    maxStudents: number;
    level: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  enrollmentCount: number;
  confirmedCount: number;
}

export interface TeacherSessionsResponse extends Array<TeacherSession> {}

export interface SessionEnrollment {
  id: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "ATTENDED"
    | "ABSENT"
    | "COMPLETED";
  enrolledAt: string;
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
    level?: string;
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
}

export interface SessionEnrollmentsResponse {
  session: {
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
  };
  enrollments: SessionEnrollment[];
  totalCount: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
    absent: number;
    completed: number;
  };
}

export interface UpdateClassDetailsRequest {
  description?: string;
  locationName?: string;
  mapImageUrl?: string;
  requiredItems?: string[];
  curriculum?: string[];
}

export interface UpdateClassDetailsResponse {
  id: number;
  className: string;
  classDetail: {
    id: number;
    description: string;
    locationName: string;
    mapImageUrl: string;
    requiredItems: string[];
    curriculum: string[];
  };
}

// 선생님 클래스와 세션 통합 응답 타입
export interface TeacherClassesWithSessionsResponse {
  classes: TeacherClassesResponse;
  sessions: TeacherSessionsResponse;
}

// 수강신청 상태 관리 타입들
export interface UpdateEnrollmentStatusRequest {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "ATTENDED"
    | "ABSENT"
    | "COMPLETED";
  reason?: string;
}

export interface UpdateEnrollmentStatusResponse extends SessionEnrollment {}

export interface BatchUpdateEnrollmentStatusRequest {
  enrollmentIds: number[];
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "ATTENDED"
    | "ABSENT"
    | "COMPLETED";
  reason?: string;
}

export interface BatchUpdateEnrollmentStatusResponse {
  success: number;
  total: number;
}
