// Academy 관련 API 타입들
import type { Academy } from "./common";

// 학원 생성 요청 타입
export interface CreateAcademyRequest {
  name: string;
  phoneNumber: string;
  address: string;
  description: string;
  code: string;
}

// 학원 목록 조회 응답 타입
export type GetAcademiesResponse = Academy[];

// 내가 가입한 학원 목록 조회 응답 타입
export type GetMyAcademiesResponse = Academy[];

// Re-export from teacher;
