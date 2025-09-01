import { get, post, put } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import {
  TeacherProfileResponse,
  UpdateTeacherProfileRequest,
  UpdateTeacherProfileResponse,
  TeacherClassesResponse,
  TeacherClassesWithSessionsResponse,
  SessionEnrollmentsResponse,
  UpdateEnrollmentStatusRequest,
  UpdateEnrollmentStatusResponse,
  BatchUpdateEnrollmentStatusRequest,
  BatchUpdateEnrollmentStatusResponse,
  Academy,
  RequestJoinAcademyRequest,
  RequestJoinAcademyResponse,
  ChangeAcademyRequest,
  ChangeAcademyResponse,
  LeaveAcademyResponse,
  TeacherDataResponse,
} from "@/types/api/teacher";

// === 프로필 관련 API ===

export const getTeacherProfile = (): Promise<
  ApiResponse<TeacherProfileResponse>
> => {
  return get<ApiResponse<TeacherProfileResponse>>("/teachers/me");
};

export const updateTeacherProfile = (
  data: UpdateTeacherProfileRequest
): Promise<ApiResponse<UpdateTeacherProfileResponse>> => {
  return put<ApiResponse<UpdateTeacherProfileResponse>>(
    "/teachers/me/profile",
    data
  );
};

export const updateTeacherProfilePhoto = (
  photo: File
): Promise<ApiResponse<UpdateTeacherProfileResponse>> => {
  const formData = new FormData();
  formData.append("photo", photo);

  return put<ApiResponse<UpdateTeacherProfileResponse>>(
    "/teachers/me/profile/photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// === Teacher 데이터 초기화 API ===

export const getTeacherData = (): Promise<ApiResponse<TeacherDataResponse>> => {
  return get<ApiResponse<TeacherDataResponse>>("/teachers/me/data");
};

// === 클래스 관련 API ===

export const getMyClasses = (): Promise<
  ApiResponse<TeacherClassesResponse>
> => {
  return get<ApiResponse<TeacherClassesResponse>>("/teachers/me/classes");
};

export const getTeacherClassesWithSessions = (): Promise<
  ApiResponse<TeacherClassesWithSessionsResponse>
> => {
  return get<ApiResponse<TeacherClassesWithSessionsResponse>>(
    "/teachers/me/classes-with-sessions"
  );
};

// === 세션 관련 API ===

export const getSessionEnrollments = (
  sessionId: number
): Promise<ApiResponse<SessionEnrollmentsResponse>> => {
  return get<ApiResponse<SessionEnrollmentsResponse>>(
    `/class-sessions/${sessionId}/enrollments`
  );
};

export const updateEnrollmentStatus = (
  enrollmentId: number,
  data: UpdateEnrollmentStatusRequest
): Promise<ApiResponse<UpdateEnrollmentStatusResponse>> => {
  return put<ApiResponse<UpdateEnrollmentStatusResponse>>(
    `/class-sessions/enrollments/${enrollmentId}/status`,
    data
  );
};

export const batchUpdateEnrollmentStatus = (
  data: BatchUpdateEnrollmentStatusRequest
): Promise<ApiResponse<BatchUpdateEnrollmentStatusResponse>> => {
  return put<ApiResponse<BatchUpdateEnrollmentStatusResponse>>(
    "/class-sessions/enrollments/batch-status",
    data
  );
};

// === 학원 관련 API ===

export const requestJoinAcademy = (
  data: RequestJoinAcademyRequest
): Promise<ApiResponse<RequestJoinAcademyResponse>> => {
  return post<ApiResponse<RequestJoinAcademyResponse>>(
    "/teachers/me/request-join-academy",
    data
  );
};

export const getMyAcademy = (): Promise<ApiResponse<Academy | null>> => {
  return get<ApiResponse<Academy | null>>("/teachers/me/academy");
};

export const changeAcademy = (
  data: ChangeAcademyRequest
): Promise<ApiResponse<ChangeAcademyResponse>> => {
  return post<ApiResponse<ChangeAcademyResponse>>(
    "/teachers/me/change-academy",
    data
  );
};

export const leaveAcademy = (): Promise<ApiResponse<LeaveAcademyResponse>> => {
  return post<ApiResponse<LeaveAcademyResponse>>("/teachers/me/leave-academy");
};
