// Teacher 전용 Redux 타입들
import type { Academy, SessionEnrollment } from "./common";

// Teacher 전용 데이터 타입
export interface TeacherData {
  // 1. 선생님의 프로필 정보 및 개인정보
  userProfile: TeacherProfile;

  // 2. 선생님이 소속된 학원
  academy: Academy | null;

  // 3. 선생님이 소속된 학원의 원장
  principal: Principal | null;

  // 4. 선생님이 담당하는 클래스 리스트 (하위 데이터 포함)
  classes: TeacherClass[];

  // 5. 클래스 리스트의 세션 (하위 데이터 포함)
  sessions: TeacherSession[];

  // 6. 모든 수강신청 정보 (세션별로 그룹화)
  enrollments: SessionEnrollment[];
}

// Teacher 관련 하위 타입들
export interface TeacherProfile {
  id: number;
  userId: string;
  name: string;
  phoneNumber?: string;
  introduction?: string;
  photoUrl?: string;
  education: string[];
  specialties: string[];
  certifications: string[];
  yearsOfExperience?: number;
  availableTimes?: any;
  academyId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Principal {
  id: number;
  userId: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  introduction?: string;
  photoUrl?: string;
  education: string[];
  certifications: string[];
  yearsOfExperience?: number;
  academyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherClass {
  id: number;
  className: string;
  classCode: string;
  description?: string;
  maxStudents: number;
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
  backgroundColor?: string;
  classDetailId?: number;
  createdAt: string;
  updatedAt: string;

  // 하위 데이터
  classSessions: ClassSession[];
  enrollments: ClassEnrollment[];
  classDetail?: ClassDetail;
}

export interface ClassSession {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  currentStudents: number;
  createdAt: string;
  updatedAt: string;

  // 하위 데이터
  enrollments: SessionEnrollment[];
  contents: SessionContent[];
}

export interface SessionContent {
  id: number;
  sessionId: number;
  poseId: number;
  order: number;
  notes?: string;
  createdAt: string;

  // 하위 데이터
  pose: BalletPose;
}

export interface BalletPose {
  id: number;
  name: string;
  imageUrl?: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  createdAt: string;
  updatedAt: string;
}

export interface ClassDetail {
  id: number;
  description: string;
  teacherId: number;
  locationName: string;
  mapImageUrl: string;
  requiredItems: string[];
  curriculum: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassEnrollment {
  id: number;
  classId: number;
  studentId: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  enrolledAt: string;
  cancelledAt?: string;

  // 하위 데이터
  student: {
    id: number;
    name: string;
  };
}

export interface TeacherSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  currentStudents: number;
  maxStudents: number;
  classId: number;
  createdAt: string;
  updatedAt: string;

  // 하위 데이터
  class: {
    id: number;
    className: string;
    level: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  enrollments: SessionEnrollment[];
  contents: SessionContent[];
}

// Teacher 상태 타입
export interface TeacherState {
  data: TeacherData | null;
  isLoading: boolean;
  error: string | null;
}
