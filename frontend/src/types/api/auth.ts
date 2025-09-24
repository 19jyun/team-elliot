// 사용자 역할 타입
type UserRole = "STUDENT" | "TEACHER" | "PRINCIPAL";

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: UserRole;
  };
}

export interface SignupRequest {
  userId: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  marketing: boolean;
}

export interface SignupResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: UserRole;
  };
}

export interface LogoutResponse {
  message: string;
}

export interface WithdrawalRequest {
  reason: string;
}

export interface WithdrawalResponse {
  message: string;
}

export interface CheckUserIdRequest {
  userId: string;
}

export interface CheckUserIdResponse {
  available: boolean;
}

export interface SendVerificationRequest {
  phoneNumber: string;
}

export interface SendVerificationResponse {
  success: boolean;
  message?: string;
}

export interface VerifyCodeRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message?: string;
}
