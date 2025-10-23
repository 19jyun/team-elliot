// Teacher 전용 Redux 타입들 (캘린더 관련 데이터만)
import type { TeacherSession } from "@/types/api/teacher";

// Teacher Redux 상태 (캘린더 관련 데이터만)
interface TeacherData {
  calendarSessions: TeacherSession[]; // 캘린더 세션 데이터
  calendarRange: {
    startDate: string;
    endDate: string;
  } | null; // 캘린더 범위
}

// Teacher Redux 상태 타입
export interface TeacherState {
  data: TeacherData | null;
  isLoading: boolean;
  error: string | null;
}
