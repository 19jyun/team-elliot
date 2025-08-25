import { get, post, del, put } from "./apiClient";
import type { Academy as StoreAcademy } from "@/types/store/common";
import type { ApiResponse } from "@/types/api";
import {
  MyClassesResponse,
  ClassDetailResponse,
  EnrollClassResponse,
  UnenrollClassResponse,
  StudentProfile,
  UpdateProfileRequest,
  EnrollmentHistoryResponse,
  CancellationHistoryResponse,
} from "../types/api/student";

export const getMyClasses = (): Promise<ApiResponse<MyClassesResponse>> =>
  get("/student/classes");
export const getClassDetail = (
  id: number
): Promise<ApiResponse<ClassDetailResponse>> => get(`/student/classes/${id}`);
export const enrollClass = (
  id: number
): Promise<ApiResponse<EnrollClassResponse>> =>
  post(`/student/classes/${id}/enroll`);
export const unenrollClass = (
  id: number
): Promise<ApiResponse<UnenrollClassResponse>> =>
  del(`/student/classes/${id}/enroll`);

// 개인 정보 조회
export const getMyProfile = (): Promise<ApiResponse<StudentProfile>> => {
  return get<ApiResponse<StudentProfile>>("/student/profile");
};

// 개인 정보 수정
export const updateMyProfile = (
  updateData: UpdateProfileRequest
): Promise<ApiResponse<StudentProfile>> => {
  return put<ApiResponse<StudentProfile>>("/student/profile", updateData);
};

// 수강 내역 조회
export const getEnrollmentHistory = (): Promise<
  ApiResponse<EnrollmentHistoryResponse>
> => {
  return get<ApiResponse<EnrollmentHistoryResponse>>(
    "/student/enrollment-history"
  );
};

// 환불/취소 내역 조회
export const getCancellationHistory = (): Promise<
  ApiResponse<CancellationHistoryResponse>
> =>
  get<ApiResponse<CancellationHistoryResponse>>(
    "/student/cancellation-history"
  );

export const getSessionPaymentInfo = (
  sessionId: number
): Promise<ApiResponse<any>> =>
  get<ApiResponse<any>>(`/student/sessions/${sessionId}/payment-info`);

// === 학생 전용: 학원 관련 (책임 분리) ===
export const getAcademies = () => get<ApiResponse<StoreAcademy[]>>("/academy");
export const joinAcademy = (data: { code: string }) =>
  post<ApiResponse<any>>("/academy/join", data);
export const leaveAcademy = (data: { academyId: number }) =>
  post<ApiResponse<any>>("/academy/leave", data);

// 내가 가입한 학원 목록 (학생 전용)
export const getMyAcademies = () =>
  get<ApiResponse<StoreAcademy[]>>("/academy/my/list");

// === 학생 전용: 수강신청/변경 관련 (기존 class-sessions.ts 기능 이관) ===
export const getStudentAvailableSessionsForEnrollment = (academyId: number) =>
  get(`/class-sessions/student/available-enrollment?academyId=${academyId}`);

export const batchEnrollSessions = (sessionIds: number[]) =>
  post("/class-sessions/batch-enroll", { sessionIds });

export const getClassSessionsForModification = (classId: number) =>
  get(`/class-sessions/class/${classId}/modification`);

export const batchModifyEnrollments = (data: {
  cancellations: number[];
  newEnrollments: number[];
  reason?: string;
}) => post("/class-sessions/batch-modify", data);

// 캘린더/클래스 상세에서 사용하는 클래스별 세션 조회 (학생용)
export const getClassSessionsForEnrollment = (classId: number) =>
  get(`/class-sessions/class/${classId}`);
