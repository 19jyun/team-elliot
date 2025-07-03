import { get, post } from "./apiClient";
import {
  GetClassSessionsResponse,
  BatchEnrollSessionsRequest,
  BatchEnrollSessionsResponse,
} from "../types/api/class";

// ClassSession 관련 API 함수들
export const getClassSessions = (
  classId: number
): Promise<GetClassSessionsResponse> => get(`/class-sessions/class/${classId}`);

export const getClassSession = (sessionId: number) =>
  get(`/class-sessions/${sessionId}`);

export const enrollSession = (sessionId: number) =>
  post(`/class-sessions/${sessionId}/enroll`);

export const batchEnrollSessions = (
  sessionIds: number[]
): Promise<BatchEnrollSessionsResponse> =>
  post("/class-sessions/batch-enroll", { sessionIds });
