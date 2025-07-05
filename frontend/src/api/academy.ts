import { apiClient } from "./apiClient";

export interface Academy {
  id: number;
  name: string;
  phoneNumber: string;
  address: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademyDto {
  name: string;
  phoneNumber: string;
  address: string;
  description: string;
  code: string;
}

export interface JoinAcademyDto {
  code: string;
}

export interface LeaveAcademyDto {
  academyId: number;
}

// 관리자용 API
export const createAcademy = (data: CreateAcademyDto) =>
  apiClient.post<Academy>("/academy", data);

export const deleteAcademy = (id: number) => apiClient.delete(`/academy/${id}`);

// 공통 API
export const getAcademies = () => apiClient.get<Academy[]>("/academy");

export const getAcademyById = (id: number) =>
  apiClient.get<Academy>(`/academy/${id}`);

// 학생용 API
export const joinAcademy = (data: JoinAcademyDto) =>
  apiClient.post("/academy/join", data);

export const leaveAcademy = (data: LeaveAcademyDto) =>
  apiClient.post("/academy/leave", data);

export const getMyAcademies = () =>
  apiClient.get<Academy[]>("/academy/my/list");
