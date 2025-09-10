import { get, post, put } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import {
  MyClassesResponse,
  StudentProfile,
  UpdateStudentProfileRequest,
  EnrollmentHistoryResponse,
  CancellationHistoryResponse,
  GetSessionPaymentInfoResponse,
  StudentJoinAcademyRequest,
  StudentJoinAcademyResponse,
  StudentLeaveAcademyRequest,
  StudentLeaveAcademyResponse,
  GetMyAcademiesResponse,
  GetStudentAvailableSessionsForEnrollmentResponse,
  StudentBatchEnrollSessionsRequest,
  StudentBatchEnrollSessionsResponse,
  StudentBatchModifyEnrollmentsRequest,
  StudentBatchModifyEnrollmentsResponse,
  TeacherProfileForStudentResponse,
} from "../types/api/student";
import { GetClassSessionsForModificationResponse } from "../types/api/class";

// === 기본 Student API ===

export const getMyClasses = (): Promise<ApiResponse<MyClassesResponse>> =>
  get<ApiResponse<MyClassesResponse>>("/student/classes");

// 개인 정보 조회
export const getMyProfile = (): Promise<ApiResponse<StudentProfile>> => {
  return get<ApiResponse<StudentProfile>>("/student/profile");
};

// 선생님 프로필 조회 (학생용)
export const getTeacherProfile = (
  teacherId: number
): Promise<ApiResponse<TeacherProfileForStudentResponse>> => {
  return get<ApiResponse<TeacherProfileForStudentResponse>>(
    `/student/teachers/${teacherId}/profile`
  );
};

// 개인 정보 수정
export const updateMyProfile = (
  updateData: UpdateStudentProfileRequest
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

// 세션별 입금 정보 조회 (결제 시 사용)
export const getSessionPaymentInfo = (
  sessionId: number
): Promise<ApiResponse<GetSessionPaymentInfoResponse>> =>
  get<ApiResponse<GetSessionPaymentInfoResponse>>(
    `/student/sessions/${sessionId}/payment-info`
  );

// === 학생 전용: 학원 관련 ===

export const joinAcademy = (
  data: StudentJoinAcademyRequest
): Promise<ApiResponse<StudentJoinAcademyResponse>> =>
  post<ApiResponse<StudentJoinAcademyResponse>>("/academy/join", data);

export const leaveAcademy = (
  data: StudentLeaveAcademyRequest
): Promise<ApiResponse<StudentLeaveAcademyResponse>> =>
  post<ApiResponse<StudentLeaveAcademyResponse>>("/academy/leave", data);

// 내가 가입한 학원 목록 (학생 전용)
export const getMyAcademies = (): Promise<
  ApiResponse<GetMyAcademiesResponse>
> => get<ApiResponse<GetMyAcademiesResponse>>("/academy/my/list");

// === 학생 전용: 수강신청/변경 관련 ===

export const getStudentAvailableSessionsForEnrollment = (
  academyId: number
): Promise<ApiResponse<GetStudentAvailableSessionsForEnrollmentResponse>> =>
  get<ApiResponse<GetStudentAvailableSessionsForEnrollmentResponse>>(
    `/class-sessions/student/available-enrollment?academyId=${academyId}`
  );

export const batchEnrollSessions = (
  data: StudentBatchEnrollSessionsRequest
): Promise<ApiResponse<StudentBatchEnrollSessionsResponse>> =>
  post<ApiResponse<StudentBatchEnrollSessionsResponse>>(
    "/class-sessions/batch-enroll",
    data
  );

export const getClassSessionsForModification = (
  classId: number
): Promise<ApiResponse<GetClassSessionsForModificationResponse>> =>
  get<ApiResponse<GetClassSessionsForModificationResponse>>(
    `/class-sessions/class/${classId}/modification`
  );

export const batchModifyEnrollments = (
  data: StudentBatchModifyEnrollmentsRequest
): Promise<ApiResponse<StudentBatchModifyEnrollmentsResponse>> =>
  post<ApiResponse<StudentBatchModifyEnrollmentsResponse>>(
    "/class-sessions/batch-modify",
    data
  );
