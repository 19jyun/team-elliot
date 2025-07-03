import { get, post, del } from "./apiClient";
import {
  GetStudentsResponse,
  GetTeachersResponse,
  GetClassesResponse,
  GetWithdrawalStatsResponse,
  CreateStudentRequest,
  CreateStudentResponse,
  CreateTeacherRequest,
  CreateTeacherResponse,
  CreateClassRequest,
  CreateClassResponse,
  ResetStudentPasswordRequest,
  ResetStudentPasswordResponse,
} from "../types/api/admin";

export const getStudents = (): Promise<GetStudentsResponse> =>
  get("/admin/students");
export const getTeachers = (): Promise<GetTeachersResponse> =>
  get("/admin/teachers");
export const getClasses = (): Promise<GetClassesResponse> =>
  get("/admin/classes");
export const getWithdrawalStats = (): Promise<GetWithdrawalStatsResponse> =>
  get("/admin/withdrawal-stats");
export const createStudent = (
  data: CreateStudentRequest
): Promise<CreateStudentResponse> => post("/admin/students", data);
export const createTeacher = (
  data: CreateTeacherRequest
): Promise<CreateTeacherResponse> => post("/admin/teachers", data);
export const createClass = (
  data: CreateClassRequest
): Promise<CreateClassResponse> => post("/admin/classes", data);
export const deleteStudent = (id: number): Promise<void> =>
  del(`/admin/students/${id}`);
export const deleteTeacher = (id: number): Promise<void> =>
  del(`/admin/teachers/${id}`);
export const deleteClass = (id: number): Promise<void> =>
  del(`/admin/classes/${id}`);
export const resetStudentPassword = (
  id: number,
  data: ResetStudentPasswordRequest
): Promise<ResetStudentPasswordResponse> =>
  post(`/admin/students/${id}/reset-password`, data);

// 클래스 세션 생성 관련 API
export const generateSessionsForClass = (
  classId: number
): Promise<{ message: string }> =>
  post(`/classes/${classId}/generate-sessions`);

export const generateSessionsForPeriod = (
  classId: number,
  data: { startDate: string; endDate: string }
): Promise<{ message: string }> =>
  post(`/classes/${classId}/generate-sessions/period`, data);
