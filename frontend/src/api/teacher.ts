import { get, put } from "./apiClient";
import {
  TeacherProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  TeacherClassesResponse,
  TeacherSessionsResponse,
  SessionEnrollmentsResponse,
  UpdateClassDetailsRequest,
  UpdateClassDetailsResponse,
  TeacherClassesWithSessionsResponse,
} from "../types/api/teacher";

// 선생님 본인용 API들 (토큰 기반)
export const getMyTeacherProfile = (): Promise<TeacherProfileResponse> =>
  get("/teachers/me");

export const updateMyTeacherProfile = (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => put("/teachers/me/profile", data);

export const getMyTeacherClasses = (): Promise<TeacherClassesResponse> =>
  get("/teachers/me/classes");

export const getMyTeacherClassesWithSessions =
  (): Promise<TeacherClassesWithSessionsResponse> =>
    get("/teachers/me/classes-with-sessions");

// 관리자용 API들 (기존 유지)
export const getTeacherProfile = (
  id: number
): Promise<TeacherProfileResponse> => get(`/teachers/${id}`);

export const updateProfile = (
  id: number,
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => put(`/teachers/${id}/profile`, data);

export const getTeacherClasses = (
  id: number
): Promise<TeacherClassesResponse> => get(`/teachers/${id}/classes`);

export const getTeacherClassesWithSessions = (
  id: number
): Promise<TeacherClassesWithSessionsResponse> =>
  get(`/teachers/${id}/classes-with-sessions`);

export const getTeacherSessions = (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<TeacherSessionsResponse> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  return get(
    `/class-sessions/teacher/sessions${queryString ? `?${queryString}` : ""}`
  );
};

export const getSessionEnrollments = (
  sessionId: number
): Promise<SessionEnrollmentsResponse> =>
  get(`/class-sessions/${sessionId}/enrollments`);

export const updateClassDetails = (
  classId: number,
  data: UpdateClassDetailsRequest
): Promise<UpdateClassDetailsResponse> =>
  put(`/classes/${classId}/details`, data);
