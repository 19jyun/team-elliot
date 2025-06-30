import { post } from "./apiClient";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  LogoutResponse,
  WithdrawalRequest,
  WithdrawalResponse,
  CheckUserIdRequest,
  CheckUserIdResponse,
} from "../types/api/auth";

export const login = (data: LoginRequest): Promise<LoginResponse> =>
  post<LoginResponse>("/auth/login", data);

export const signup = (data: SignupRequest): Promise<SignupResponse> =>
  post<SignupResponse>("/auth/signup", data);

export const logout = (): Promise<LogoutResponse> =>
  post<LogoutResponse>("/auth/logout");

export const withdrawal = (
  data: WithdrawalRequest
): Promise<WithdrawalResponse> =>
  post<WithdrawalResponse>("/auth/withdrawal", data);

export const checkDuplicateUserId = (
  userId: string
): Promise<CheckUserIdResponse> =>
  post<CheckUserIdResponse>("/auth/check-userid", {
    userId,
  } as CheckUserIdRequest);
