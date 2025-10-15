import { post, get } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  CheckUserIdRequest,
  CheckUserIdResponse,
  SendVerificationRequest,
  SendVerificationResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  SignupRequest,
  SignupResponse,
  PrincipalSignupRequest,
  PrincipalSignupResponse,
  SessionResponse,
  VerifyResponse,
} from "@/types/api/auth";

// 로그인
export const login = (
  data: LoginRequest
): Promise<ApiResponse<LoginResponse>> => {
  return post<ApiResponse<LoginResponse>>("/auth/login", data);
};

// 로그아웃
export const logout = (): Promise<ApiResponse<LogoutResponse>> => {
  return post<ApiResponse<LogoutResponse>>("/auth/logout");
};

// 토큰 갱신
export const refreshToken = (data: {
  userId: string;
}): Promise<ApiResponse<RefreshTokenResponse>> => {
  return post<ApiResponse<RefreshTokenResponse>>("/auth/refresh", data);
};

// 아이디 중복 체크
export const checkUserId = (
  data: CheckUserIdRequest
): Promise<ApiResponse<CheckUserIdResponse>> => {
  return post<ApiResponse<CheckUserIdResponse>>("/auth/check-userid", data);
};

// SMS 인증번호 발송
export const sendVerification = (
  data: SendVerificationRequest
): Promise<ApiResponse<SendVerificationResponse>> => {
  return post<ApiResponse<SendVerificationResponse>>(
    "/sms/send-verification",
    data
  );
};

// SMS 인증번호 검증
export const verifyCode = (
  data: VerifyCodeRequest
): Promise<ApiResponse<VerifyCodeResponse>> => {
  return post<ApiResponse<VerifyCodeResponse>>("/sms/verify-code", data);
};

// 회원가입 (Student, Teacher)
export const signup = (
  data: SignupRequest
): Promise<ApiResponse<SignupResponse>> => {
  return post<ApiResponse<SignupResponse>>("/auth/signup", data);
};

// Principal 회원가입 (학원 정보 포함)
export const signupPrincipal = (
  data: PrincipalSignupRequest
): Promise<ApiResponse<PrincipalSignupResponse>> => {
  return post<ApiResponse<PrincipalSignupResponse>>(
    "/auth/signup/principal",
    data
  );
};

// 현재 세션 정보 조회
export const getSession = (): Promise<ApiResponse<SessionResponse>> => {
  return get<ApiResponse<SessionResponse>>("/auth/session");
};

// 토큰 유효성 검증
export const verifyToken = (): Promise<ApiResponse<VerifyResponse>> => {
  return get<ApiResponse<VerifyResponse>>("/auth/verify");
};
