// Principal 전용 Redux 타입들
import type {
  Academy,
  SessionEnrollment,
  RefundRequest,
  Class,
  Teacher,
  Student,
} from "./common";

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

// Principal 관련 하위 타입들
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

// Principal 상태 타입
export interface PrincipalState {
  data: PrincipalData | null;
  isLoading: boolean;
  error: string | null;
}
