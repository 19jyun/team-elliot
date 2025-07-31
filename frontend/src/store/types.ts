// 사용자 관련 타입
export interface User {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN" | "PRINCIPAL";
  phoneNumber?: string;
}

// 학원 관련 타입
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

// 클래스 관련 타입
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
}

// 수강신청 관련 타입
export interface SessionEnrollment {
  id: number;
  studentId: number;
  sessionId: number;
  status: string;
  enrolledAt: string;
  cancelledAt?: string;
  rejectedAt?: string;
  session: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    class: {
      id: number;
      className: string;
      teacher: {
        name: string;
      };
    };
  };
  student: {
    id: number;
    name: string;
  };
}

// 환불 요청 관련 타입
export interface RefundRequest {
  id: number;
  sessionEnrollmentId: number;
  studentId: number;
  reason: string;
  detailedReason?: string;
  refundAmount: number;
  status: string;
  processReason?: string;
  actualRefundAmount?: number;
  processedBy?: number;
  processedAt?: string;
  requestedAt: string;
  cancelledAt?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  sessionEnrollment: {
    session: {
      id: number;
      date: string;
      startTime: string;
      endTime: string;
      class: {
        id: number;
        className: string;
        teacher: {
          name: string;
        };
      };
    };
    date: string;
    startTime: string;
    endTime: string;
  };
  student: {
    name: string;
  };
  processor?: {
    name: string;
  };
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

// 역할별 데이터 타입 정의
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

// Principal 전용 데이터 타입
export interface PrincipalData {
  userProfile: PrincipalProfile;
  academy: Academy;
  enrollments: SessionEnrollment[];
  refundRequests: RefundRequest[];
  classes: Class[];
  teachers: Teacher[];
  students: Student[];
}

// Student 전용 데이터 타입 (추후 확장용)
export interface StudentData {
  // 추후 Student 관련 데이터 타입 정의 예정
  profile?: any;
  enrollments?: any[];
  classes?: any[];
  payments?: any[];
  attendance?: any[];
}

// Teacher 전용 데이터 타입 (추후 확장용)
export interface TeacherData {
  // 추후 Teacher 관련 데이터 타입 정의 예정
  profile?: any;
  classes?: any[];
  students?: any[];
  schedules?: any[];
  evaluations?: any[];
}

// Admin 전용 데이터 타입 (추후 확장용)
export interface AdminData {
  // 추후 Admin 관련 데이터 타입 정의 예정
  students?: Student[];
  teachers?: Teacher[];
  classes?: Class[];
}

// 역할별 데이터 유니온 타입
export type RoleSpecificData =
  | { role: "PRINCIPAL"; data: PrincipalData }
  | { role: "STUDENT"; data: StudentData }
  | { role: "TEACHER"; data: TeacherData }
  | { role: "ADMIN"; data: AdminData };
