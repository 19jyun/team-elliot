// API 응답 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  statusCode?: number;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path?: string;
}

// 에러 타입 정의
export enum ErrorType {
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  BUSINESS = "BUSINESS",
  NETWORK = "NETWORK",
  SYSTEM = "SYSTEM",
}

export interface AppError {
  type: ErrorType;
  code: string;
  message: string;
  field?: string;
  fieldErrors?: FieldError[];
  action?: () => void;
  recoverable?: boolean;
}

export interface FieldError {
  field: string;
  message: string;
  value?: unknown;
}
