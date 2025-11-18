import { post } from "./apiClient";
import type {
  LoggerLevel,
  LoggerRequestPayload,
  LoggerResponse,
} from "@/types/api/logger";

export const sendRemoteLog = async (
  endpoint: string,
  payload: LoggerRequestPayload
): Promise<LoggerResponse | void> => {
  if (!endpoint) {
    return;
  }

  return post<LoggerResponse, LoggerRequestPayload>(endpoint, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export type { LoggerLevel, LoggerRequestPayload, LoggerResponse };
