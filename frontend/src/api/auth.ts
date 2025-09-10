import { post } from "./apiClient";
import { clearApiClientSessionCache } from "./apiClient";
import { clearSessionCache } from "@/lib/axios";
import {
  // LoginRequest,
  // LoginResponse,
  // SignupRequest,
  // SignupResponse,
  LogoutResponse,
  // WithdrawalRequest,
  // WithdrawalResponse,
  CheckUserIdRequest,
  CheckUserIdResponse,
} from "../types/api/auth";

// const _login = (data: LoginRequest): Promise<LoginResponse> =>
//   post<LoginResponse>("/auth/login", data);

// const _signup = (data: SignupRequest): Promise<SignupResponse> =>
//   post<SignupResponse>("/auth/signup", data);

// 미사용 메서드들 주석처리

export const logout = async (): Promise<LogoutResponse> => {
  // 세션 캐시 클리어
  clearSessionCache();
  clearApiClientSessionCache();

  // 백엔드 로그아웃 API 호출
  return post<LogoutResponse>("/auth/logout");
};

// const _withdrawal = (data: WithdrawalRequest): Promise<WithdrawalResponse> =>
//   post<WithdrawalResponse>("/auth/withdrawal", data);

export const checkDuplicateUserId = (
  userId: string
): Promise<CheckUserIdResponse> =>
  post<CheckUserIdResponse>("/auth/check-userid", {
    userId,
  } as CheckUserIdRequest);
