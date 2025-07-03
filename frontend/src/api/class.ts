import { get, post, put, del } from "./apiClient";
import {
  ClassDetailsResponse,
  AllClassesResponse,
  CreateClassRequest,
  CreateClassResponse,
  UpdateClassRequest,
  UpdateClassResponse,
  EnrollClassRequest,
  EnrollClassResponse,
  UnenrollClassRequest,
  UnenrollClassResponse,
  ClassesByMonthResponse,
} from "../types/api/class";

export const getClassDetails = (id: number): Promise<ClassDetailsResponse> =>
  get(`/classes/${id}/details`);
export const getAllClasses = (
  params?: Record<string, any>
): Promise<AllClassesResponse> => get("/classes", { params });
export const createClass = (
  data: CreateClassRequest
): Promise<CreateClassResponse> => post("/classes", data);
export const updateClass = (
  id: number,
  data: UpdateClassRequest
): Promise<UpdateClassResponse> => put(`/classes/${id}`, data);
export const deleteClass = (id: number): Promise<void> => del(`/classes/${id}`);
export const enrollClass = (
  id: number,
  data: EnrollClassRequest
): Promise<EnrollClassResponse> => post(`/classes/${id}/enroll`, data);
export const unenrollClass = (
  id: number,
  data: UnenrollClassRequest
): Promise<UnenrollClassResponse> => del(`/classes/${id}/enroll`, { data });
export const getClassesByMonth = (
  month: string,
  year: string
): Promise<ClassesByMonthResponse> =>
  get(`/classes/month/${month}`, { params: { year } });

export const getClassCards = (month: string, year: number) =>
  get(`/classes/month/${month}?year=${year}`);

export const enrollSession = (sessionId: number) =>
  post(`/class-sessions/${sessionId}/enroll`);

export const batchEnrollSessions = (sessionIds: number[]) =>
  post("/class-sessions/batch-enroll", { sessionIds });
