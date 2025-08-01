// Student 전용 Redux 타입들

// Student 전용 데이터 타입 (추후 확장용)
export interface StudentData {
  // 추후 Student 관련 데이터 타입 정의 예정
  profile?: any;
  enrollments?: any[];
  classes?: any[];
  payments?: any[];
  attendance?: any[];
}

// Student 상태 타입
export interface StudentState {
  data: StudentData | null;
}
