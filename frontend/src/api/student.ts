import { get, post, del } from "./apiClient";
import {
  MyClassesResponse,
  ClassDetailResponse,
  EnrollClassResponse,
  UnenrollClassResponse,
} from "../types/api/student";

export const getMyClasses = (): Promise<MyClassesResponse> =>
  get("/student/classes");
export const getClassDetail = (id: number): Promise<ClassDetailResponse> =>
  get(`/student/classes/${id}`);
export const enrollClass = (id: number): Promise<EnrollClassResponse> =>
  post(`/student/classes/${id}/enroll`);
export const unenrollClass = (id: number): Promise<UnenrollClassResponse> =>
  del(`/student/classes/${id}/enroll`);
