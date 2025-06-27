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
