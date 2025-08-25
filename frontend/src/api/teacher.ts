import { get, post, put } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import {
  TeacherProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  TeacherClassesWithSessionsResponse,
  SessionEnrollmentsResponse,
  UpdateEnrollmentStatusRequest,
  UpdateEnrollmentStatusResponse,
  BatchUpdateEnrollmentStatusRequest,
  BatchUpdateEnrollmentStatusResponse,
} from "@/types/api/teacher";

// 프로필 관련 API
export const getTeacherProfile = (): Promise<
  ApiResponse<TeacherProfileResponse>
> => {
  return get<ApiResponse<TeacherProfileResponse>>("/teachers/me");
};

// ID 기반 조회는 백엔드 미지원 → 제거

export const updateTeacherProfile = (
  data: UpdateProfileRequest
): Promise<ApiResponse<UpdateProfileResponse>> => {
  return put<ApiResponse<UpdateProfileResponse>>("/teachers/me/profile", data);
};

export const updateTeacherProfilePhoto = (
  photo: File
): Promise<ApiResponse<UpdateProfileResponse>> => {
  const formData = new FormData();
  formData.append("photo", photo);

  return put<ApiResponse<UpdateProfileResponse>>(
    "/teachers/me/profile/photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// 클래스 관련 API
// 교사용: 내 클래스 및 세션 묶음 조회

export const getTeacherClassesWithSessions = (): Promise<
  ApiResponse<TeacherClassesWithSessionsResponse>
> => {
  return get<ApiResponse<TeacherClassesWithSessionsResponse>>(
    "/teachers/me/classes-with-sessions"
  );
};

// 세션 관련 API
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

// 클래스 상세 수정은 원장 전용 → 제거

// 학원 관련 API (교사용)
export const getMyAcademy = (): Promise<ApiResponse<any>> => {
  return get<ApiResponse<any>>("/teachers/me/academy");
};

export const changeAcademy = (data: {
  code: string;
}): Promise<ApiResponse<any>> => {
  return post<ApiResponse<any>>("/teachers/me/change-academy", data);
};

// 백엔드 미지원: 학원 생성/생성+가입 API 제거

// 백엔드 미지원: 학원 수정 제거

export const leaveAcademy = (): Promise<ApiResponse<any>> => {
  return post<ApiResponse<any>>("/teachers/me/leave-academy");
};

export const requestJoinAcademy = (data: {
  code: string;
}): Promise<ApiResponse<any>> => {
  return post<ApiResponse<any>>("/teachers/me/request-join-academy", data);
};
// 백엔드 미지원: 학원 선생 목록/원장 정보/Redux 초기화 API 제거
