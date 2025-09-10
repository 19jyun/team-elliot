import { get, post, put, del } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import {
  GetPrincipalAcademyResponse,
  GetPrincipalAllSessionsResponse,
  GetPrincipalAllClassesResponse,
  GetPrincipalAllTeachersResponse,
  GetPrincipalAllStudentsResponse,
  UpdatePrincipalProfileRequest,
  UpdatePrincipalAcademyRequest,
  PrincipalProfile,
  SessionContentResponse,
  CreateSessionContentResponse,
  UpdateSessionContentResponse,
  DeleteSessionContentResponse,
  ReorderSessionContentsRequest,
  ReorderSessionContentsResponse,
  ApproveEnrollmentResponse,
  RejectEnrollmentRequest,
  RejectEnrollmentResponse,
  ApproveRefundResponse,
  RejectRefundRequest,
  RejectRefundResponse,
  RemoveTeacherResponse,
  RemoveStudentResponse,
  StudentSessionHistory,
  CreatePrincipalClassRequest,
} from "../types/api/principal";
import { CreateClassResponse } from "../types/api/class";
import { GetSessionEnrollmentsResponse } from "../types/api/class-session";
import { SessionEnrollmentsResponse } from "../types/api/teacher";
import { GetRefundRequestsResponse } from "../types/api/refund";

// Principal 전용 API 함수들

// 1. Principal의 학원 정보 조회
export const getPrincipalAcademy = (): Promise<
  ApiResponse<GetPrincipalAcademyResponse>
> => {
  return get<ApiResponse<GetPrincipalAcademyResponse>>("/principal/academy");
};

// 2. Principal의 학원에 속한 모든 세션 조회 (캘린더용)
export const getPrincipalAllSessions = (): Promise<
  ApiResponse<GetPrincipalAllSessionsResponse>
> => {
  return get<ApiResponse<GetPrincipalAllSessionsResponse>>(
    "/principal/sessions"
  );
};

// 3. Principal의 학원에 속한 모든 클래스 조회
export const getPrincipalAllClasses = (): Promise<
  ApiResponse<GetPrincipalAllClassesResponse>
> => {
  return get<ApiResponse<GetPrincipalAllClassesResponse>>("/principal/classes");
};

// Principal의 클래스 생성
export const createPrincipalClass = (
  data: CreatePrincipalClassRequest
): Promise<ApiResponse<CreateClassResponse>> => {
  return post<ApiResponse<CreateClassResponse>>("/principal/classes", data);
};

// 4. Principal의 학원에 속한 모든 선생님 조회
export const getPrincipalAllTeachers = (): Promise<
  ApiResponse<GetPrincipalAllTeachersResponse>
> => {
  return get<ApiResponse<GetPrincipalAllTeachersResponse>>(
    "/principal/teachers"
  );
};

// 5. Principal의 학원에 속한 모든 수강생 조회
export const getPrincipalAllStudents = (): Promise<
  ApiResponse<GetPrincipalAllStudentsResponse>
> => {
  return get<ApiResponse<GetPrincipalAllStudentsResponse>>(
    "/principal/students"
  );
};

// 6. Principal의 학원에 속한 모든 수강신청 조회 (Redux store용)
export const getPrincipalAllEnrollments = (): Promise<
  ApiResponse<GetSessionEnrollmentsResponse[]>
> => {
  return get<ApiResponse<GetSessionEnrollmentsResponse[]>>(
    "/principal/enrollments"
  );
};

// 7. Principal의 학원에 속한 모든 환불요청 조회 (Redux store용)
export const getPrincipalAllRefundRequests = (): Promise<
  ApiResponse<GetRefundRequestsResponse>
> => {
  return get<ApiResponse<GetRefundRequestsResponse>>(
    "/principal/refund-requests"
  );
};

// Principal의 세션 수강생 조회
export const getPrincipalSessionEnrollments = (
  sessionId: number
): Promise<ApiResponse<SessionEnrollmentsResponse>> => {
  return get<ApiResponse<SessionEnrollmentsResponse>>(
    `/principal/sessions/${sessionId}/enrollments`
  );
};

// === Principal 세션 컨텐츠 관리 API ===
export const getSessionContents = (
  sessionId: number
): Promise<ApiResponse<SessionContentResponse[]>> => {
  return get<ApiResponse<SessionContentResponse[]>>(
    `/principal/sessions/${sessionId}/contents`
  );
};

export const addSessionContent = (
  sessionId: number,
  data: { poseId: number; notes?: string }
): Promise<ApiResponse<CreateSessionContentResponse>> => {
  return post<ApiResponse<CreateSessionContentResponse>>(
    `/principal/sessions/${sessionId}/contents`,
    data
  );
};

export const updateSessionContent = (
  sessionId: number,
  contentId: number,
  data: { poseId?: number; notes?: string }
): Promise<ApiResponse<UpdateSessionContentResponse>> => {
  return put<ApiResponse<UpdateSessionContentResponse>>(
    `/principal/sessions/${sessionId}/contents/${contentId}`,
    data
  );
};

export const deleteSessionContent = (
  sessionId: number,
  contentId: number
): Promise<ApiResponse<DeleteSessionContentResponse>> => {
  return del<ApiResponse<DeleteSessionContentResponse>>(
    `/principal/sessions/${sessionId}/contents/${contentId}`
  );
};

export const reorderSessionContents = (
  sessionId: number,
  data: ReorderSessionContentsRequest
): Promise<ApiResponse<ReorderSessionContentsResponse>> => {
  return put<ApiResponse<ReorderSessionContentsResponse>>(
    `/principal/sessions/${sessionId}/contents/reorder`,
    data
  );
};

// Principal의 학원 정보 수정
export const updatePrincipalAcademy = (
  data: UpdatePrincipalAcademyRequest
): Promise<ApiResponse<GetPrincipalAcademyResponse>> => {
  return put<ApiResponse<GetPrincipalAcademyResponse>>(
    "/principal/academy",
    data
  );
};

// Principal의 프로필 정보 조회
export const getPrincipalProfile = (
  principalId?: number
): Promise<ApiResponse<PrincipalProfile>> => {
  const url = principalId
    ? `/principal/${principalId}/profile`
    : "/principal/profile";
  return get<ApiResponse<PrincipalProfile>>(url);
};

// Principal의 프로필 정보 수정
export const updatePrincipalProfile = (
  data: UpdatePrincipalProfileRequest
): Promise<ApiResponse<PrincipalProfile>> => {
  return put<ApiResponse<PrincipalProfile>>("/principal/profile", data);
};

// Principal의 프로필 사진 업로드
export const updatePrincipalProfilePhoto = (
  photo: File
): Promise<ApiResponse<PrincipalProfile>> => {
  const formData = new FormData();
  formData.append("photo", photo);

  return put<ApiResponse<PrincipalProfile>>(
    "/principal/profile/photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// 3. 수강 신청 승인
export const approvePrincipalEnrollment = (
  enrollmentId: number
): Promise<ApiResponse<ApproveEnrollmentResponse>> => {
  return post<ApiResponse<ApproveEnrollmentResponse>>(
    `/principal/enrollments/${enrollmentId}/approve`
  );
};

// 4. 수강 신청 거절
export const rejectPrincipalEnrollment = (
  enrollmentId: number,
  data: RejectEnrollmentRequest
): Promise<ApiResponse<RejectEnrollmentResponse>> => {
  return post<ApiResponse<RejectEnrollmentResponse>>(
    `/principal/enrollments/${enrollmentId}/reject`,
    data
  );
};

// 5. 환불 요청 승인
export const approvePrincipalRefund = (
  refundId: number
): Promise<ApiResponse<ApproveRefundResponse>> => {
  return post<ApiResponse<ApproveRefundResponse>>(
    `/principal/refunds/${refundId}/approve`
  );
};

// 6. 환불 요청 거절
export const rejectPrincipalRefund = (
  refundId: number,
  data: RejectRefundRequest
): Promise<ApiResponse<RejectRefundResponse>> => {
  return put<ApiResponse<RejectRefundResponse>>(
    `/principal/refunds/${refundId}/reject`,
    data
  );
};

// 3. 선생님을 학원에서 제거
export const removePrincipalTeacher = (
  teacherId: number
): Promise<ApiResponse<RemoveTeacherResponse>> => {
  return del<ApiResponse<RemoveTeacherResponse>>(
    `/principal/teachers/${teacherId}`
  );
};

// 6. 수강생을 학원에서 제거
export const removePrincipalStudent = (
  studentId: number
): Promise<ApiResponse<RemoveStudentResponse>> => {
  return del<ApiResponse<RemoveStudentResponse>>(
    `/principal/students/${studentId}`
  );
};

// 7. 수강생의 세션 수강 현황 조회
export const getPrincipalStudentSessionHistory = (
  studentId: number
): Promise<ApiResponse<StudentSessionHistory[]>> => {
  return get<ApiResponse<StudentSessionHistory[]>>(
    `/principal/students/${studentId}/sessions`
  );
};
