// Academy 관련 API 타입들

// 학원 정보 타입
export interface Academy {
  id: number;
  name: string;
  code: string;
  phoneNumber: string;
  address: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 학원 생성 요청 타입
export interface CreateAcademyRequest {
  name: string;
  phoneNumber: string;
  address: string;
  description: string;
  code: string;
}

// 학원 생성 응답 타입
export type CreateAcademyResponse = Academy;

// 학원 상세 조회 응답 타입
export type GetAcademyByIdResponse = Academy;

// 학원 목록 조회 응답 타입
export type GetAcademiesResponse = Academy[];

// 학원 가입 요청 타입
export interface JoinAcademyRequest {
  code: string;
}

// 학원 가입 응답 타입
export interface JoinAcademyResponse {
  message: string;
  academy: Academy;
}

// 학원 탈퇴 요청 타입
export interface LeaveAcademyRequest {
  academyId: number;
}

// 학원 탈퇴 응답 타입
export interface LeaveAcademyResponse {
  message: string;
}

// 내가 가입한 학원 목록 조회 응답 타입
export type GetMyAcademiesResponse = Academy[];

// 학원 삭제 응답 타입
export interface DeleteAcademyResponse {
  message: string;
}
