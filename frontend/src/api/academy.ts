import { get, post, del } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import {
  Academy,
  CreateAcademyRequest,
  CreateAcademyResponse,
  GetAcademyByIdResponse,
  GetAcademiesResponse,
  JoinAcademyRequest,
  JoinAcademyResponse,
  LeaveAcademyRequest,
  LeaveAcademyResponse,
  GetMyAcademiesResponse,
  DeleteAcademyResponse,
} from "../types/api/academy";

// 학원 생성 (원장)
export const createAcademy = (
  data: CreateAcademyRequest
): Promise<ApiResponse<CreateAcademyResponse>> => {
  return post<ApiResponse<CreateAcademyResponse>>("/academy", data);
};

// 학원 삭제 (원장)
export const deleteAcademy = (
  id: number
): Promise<ApiResponse<DeleteAcademyResponse>> => {
  return del<ApiResponse<DeleteAcademyResponse>>(`/academy/${id}`);
};

// 학원 목록 조회
export const getAcademies = (): Promise<ApiResponse<GetAcademiesResponse>> => {
  return get<ApiResponse<GetAcademiesResponse>>("/academy");
};

// 학원 상세 조회
export const getAcademyById = (
  id: number
): Promise<ApiResponse<GetAcademyByIdResponse>> => {
  return get<ApiResponse<GetAcademyByIdResponse>>(`/academy/${id}`);
};

// 학원 가입 (학생)
export const joinAcademy = (
  data: JoinAcademyRequest
): Promise<ApiResponse<JoinAcademyResponse>> => {
  return post<ApiResponse<JoinAcademyResponse>>("/academy/join", data);
};

// 학원 탈퇴 (학생)
export const leaveAcademy = (
  data: LeaveAcademyRequest
): Promise<ApiResponse<LeaveAcademyResponse>> => {
  return post<ApiResponse<LeaveAcademyResponse>>("/academy/leave", data);
};

// 내가 가입한 학원 목록 (학생)
export const getMyAcademies = (): Promise<
  ApiResponse<GetMyAcademiesResponse>
> => {
  return get<ApiResponse<GetMyAcademiesResponse>>("/academy/my/list");
};
