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

// 페이지네이션 관련 타입 정의
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
  path: string;
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
