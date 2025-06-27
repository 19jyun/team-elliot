import { get, put } from "./apiClient";
import {
  TeacherProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  TeacherClassesResponse,
} from "../types/api/teacher";

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
