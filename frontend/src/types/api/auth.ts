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
