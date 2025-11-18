export type LoggerLevel = "debug" | "info" | "warn" | "error";

export interface LoggerRequestPayload {
  level: LoggerLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export interface LoggerResponse {
  success: boolean;
  message?: string;
}
