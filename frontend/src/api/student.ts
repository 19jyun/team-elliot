import { get, post, del, put } from "./apiClient";
import {
  MyClassesResponse,
  ClassDetailResponse,
  EnrollClassResponse,
  UnenrollClassResponse,
  StudentProfile,
  UpdateProfileRequest,
} from "../types/api/student";

export const getMyClasses = (): Promise<MyClassesResponse> =>
  get("/student/classes");
export const getClassDetail = (id: number): Promise<ClassDetailResponse> =>
  get(`/student/classes/${id}`);
export const enrollClass = (id: number): Promise<EnrollClassResponse> =>
  post(`/student/classes/${id}/enroll`);
export const unenrollClass = (id: number): Promise<UnenrollClassResponse> =>
  del(`/student/classes/${id}/enroll`);

// 개인 정보 조회
export const getMyProfile = (): Promise<StudentProfile> => {
  return get<StudentProfile>("/student/profile");
};

// 개인 정보 수정
export const updateMyProfile = (
  updateData: UpdateProfileRequest
): Promise<StudentProfile> => {
  return put<StudentProfile>("/student/profile", updateData);
};
