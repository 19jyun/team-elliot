// Class-session 관련 API 타입들
// import type { EnrollmentStatus } from "./common"; // 사용하지 않음
import type { ClassSession, SessionEnrollment } from "./class";

// UpdateEnrollmentStatusRequest와 UpdateEnrollmentStatusResponse는 teacher.ts에서 정의됨

// 특정 세션의 수강생 목록 조회 응답 타입
export type GetSessionEnrollmentsResponse = SessionEnrollment[];

// Re-export from class
export type { ClassSession };
