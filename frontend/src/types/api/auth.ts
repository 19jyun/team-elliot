// 사용자 역할 타입
type UserRole = "STUDENT" | "TEACHER" | "PRINCIPAL";

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: UserRole;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
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
  role: "STUDENT" | "TEACHER"; // PRINCIPAL 제거
}

export interface SignupResponse {
  access_token: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: UserRole;
  };
}

// Principal 전용 회원가입 타입들
export interface AcademyInfo {
  name: string;
  phoneNumber: string;
  address: string;
  description: string;
}

export interface PrincipalSignupRequest {
  userId: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: "PRINCIPAL";
  academyInfo: AcademyInfo;
}

export interface PrincipalSignupResponse {
  access_token: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: "PRINCIPAL";
  };
  academy: {
    id: number;
    name: string;
    code: string;
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
  message: string;
}

export interface VerifyCodeRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyCodeResponse {
  verified: boolean;
  message: string;
}

// 새로운 API 응답 타입들
export interface SessionResponse {
  user: {
    id: number;
    userId: string;
    name: string;
    role: UserRole;
  };
  accessToken: string;
  expiresAt: number;
}

export interface VerifyResponse {
  valid: boolean;
  user: {
    id: number;
    userId: string;
    name: string;
    role: UserRole;
  };
}
