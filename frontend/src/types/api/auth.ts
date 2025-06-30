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
    role: string;
    [key: string]: any;
  };
}

export interface SignupRequest {
  userId: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: string;
  [key: string]: any;
}

export interface SignupResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    userId: string;
    name: string;
    role: string;
    [key: string]: any;
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
