import { post } from "./apiClient";
import { clearApiClientSessionCache } from "./apiClient";
import { clearSessionCache } from "@/lib/axios";
import {
  // LoginRequest,
  // LoginResponse,
  SignupRequest,
  SignupResponse,
  LogoutResponse,
  // WithdrawalRequest,
  // WithdrawalResponse,
  CheckUserIdRequest,
  CheckUserIdResponse,
  SendVerificationRequest,
  SendVerificationResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from "../types/api/auth";

// const _login = (data: LoginRequest): Promise<LoginResponse> =>
//   post<LoginResponse>("/auth/login", data);

// 회원가입
export const signup = (data: SignupRequest): Promise<SignupResponse> =>
  post<SignupResponse>("/auth/signup", data);

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

// 인증번호 발송
export const sendVerification = (
  data: SendVerificationRequest
): Promise<SendVerificationResponse> =>
  post<SendVerificationResponse>("/auth/send-verification", data);

// 인증번호 검증
export const verifyCode = (
  data: VerifyCodeRequest
): Promise<VerifyCodeResponse> =>
  post<VerifyCodeResponse>("/auth/verify-code", data);
