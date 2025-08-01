// Admin 전용 Redux 타입들
import type { Student, Teacher, Class } from "./common";

// Admin 전용 데이터 타입 (추후 확장용)
export interface AdminData {
  // 추후 Admin 관련 데이터 타입 정의 예정
  students?: Student[];
  teachers?: Teacher[];
  classes?: Class[];
}

// Admin 상태 타입
export interface AdminState {
  data: AdminData | null;
}
