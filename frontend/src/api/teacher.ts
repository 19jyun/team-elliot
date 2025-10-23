import { get, post, put } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import {
  TeacherProfileResponse,
  UpdateTeacherProfileRequest,
  UpdateTeacherProfileResponse,
  TeacherClassesWithSessionsResponse,
  SessionEnrollmentsResponse,
  UpdateEnrollmentStatusRequest,
  UpdateEnrollmentStatusResponse,
  RequestJoinAcademyRequest,
  RequestJoinAcademyResponse,
  LeaveAcademyResponse,
  UpdateClassDetailsRequest,
  UpdateClassDetailsResponse,
  TeacherAcademyStatusResponse,
} from "@/types/api/teacher";
import type { Academy } from "@/types/api/common";

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

// === 클래스 관련 API ===

export const getTeacherClassesWithSessions = (): Promise<
  ApiResponse<TeacherClassesWithSessionsResponse>
> => {
  return get<ApiResponse<TeacherClassesWithSessionsResponse>>(
    "/teachers/me/classes-with-sessions"
  );
};

export const updateClassDetails = (
  classId: number,
  data: UpdateClassDetailsRequest
): Promise<ApiResponse<UpdateClassDetailsResponse>> => {
  return put<ApiResponse<UpdateClassDetailsResponse>>(
    `/classes/${classId}/details`,
    data
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

export const leaveAcademy = (): Promise<ApiResponse<LeaveAcademyResponse>> => {
  return post<ApiResponse<LeaveAcademyResponse>>("/teachers/me/leave-academy");
};

// === 학원 가입 상태 관련 API ===

export const getTeacherAcademyStatus = (): Promise<
  ApiResponse<TeacherAcademyStatusResponse>
> => {
  return get<ApiResponse<TeacherAcademyStatusResponse>>(
    "/teachers/me/academy-status"
  );
};
