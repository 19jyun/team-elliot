import { get, post, del, put } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import {
  MyClassesResponse,
  ClassDetailResponse,
  StudentProfile,
  UpdateStudentProfileRequest,
  EnrollmentHistoryResponse,
  CancellationHistoryResponse,
  GetSessionPaymentInfoResponse,
  StudentJoinAcademyRequest,
  StudentJoinAcademyResponse,
  StudentLeaveAcademyRequest,
  StudentLeaveAcademyResponse,
  GetAcademiesResponse,
  GetMyAcademiesResponse,
  GetStudentAvailableSessionsForEnrollmentResponse,
  StudentBatchEnrollSessionsRequest,
  StudentBatchEnrollSessionsResponse,
  StudentBatchModifyEnrollmentsRequest,
  StudentBatchModifyEnrollmentsResponse,
  RemoveStudentFromAcademyResponse,
  TeacherProfileForStudentResponse,
} from "../types/api/student";
import {
  GetClassSessionsForModificationResponse,
  EnrollClassResponse,
  GetClassSessionsForEnrollmentResponse,
  UnenrollClassResponse,
} from "../types/api/class";

// === 기본 Student API ===

export const getMyClasses = (): Promise<ApiResponse<MyClassesResponse>> =>
  get<ApiResponse<MyClassesResponse>>("/student/classes");

export const getClassDetail = (
  id: number
): Promise<ApiResponse<ClassDetailResponse>> =>
  get<ApiResponse<ClassDetailResponse>>(`/student/classes/${id}`);

export const enrollClass = (
  id: number
): Promise<ApiResponse<EnrollClassResponse>> =>
  post<ApiResponse<EnrollClassResponse>>(`/student/classes/${id}/enroll`);

export const unenrollClass = (
  id: number
): Promise<ApiResponse<UnenrollClassResponse>> =>
  del<ApiResponse<UnenrollClassResponse>>(`/student/classes/${id}/enroll`);

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

export const getAcademies = (): Promise<ApiResponse<GetAcademiesResponse>> =>
  get<ApiResponse<GetAcademiesResponse>>("/academy");

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

// 캘린더/클래스 상세에서 사용하는 클래스별 세션 조회 (학생용)
export const getClassSessionsForEnrollment = (
  classId: number
): Promise<ApiResponse<GetClassSessionsForEnrollmentResponse>> =>
  get<ApiResponse<GetClassSessionsForEnrollmentResponse>>(
    `/class-sessions/class/${classId}`
  );

// === 선생님용: 수강생을 학원에서 제거 ===

export const removeStudentFromAcademy = (
  studentId: number
): Promise<ApiResponse<RemoveStudentFromAcademyResponse>> =>
  del<ApiResponse<RemoveStudentFromAcademyResponse>>(
    `/student/academy/students/${studentId}`
  );
