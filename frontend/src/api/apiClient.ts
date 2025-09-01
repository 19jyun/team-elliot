import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";
import { ErrorHandler } from "@/lib/errorHandler";
import { ApiResponse } from "@/types/api";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 세션 캐싱을 위한 변수
let cachedSession: Session | null = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5분

// 세션을 가져오는 함수 (캐싱 적용)
const getCachedSession = async (): Promise<Session | null> => {
  const now = Date.now();

  // 캐시가 유효한 경우 캐시된 세션 반환
  if (cachedSession && now - sessionCacheTime < SESSION_CACHE_DURATION) {
    return cachedSession;
  }

  // 캐시가 만료되었거나 없는 경우 새로 가져오기
  try {
    const session = await getSession();
    cachedSession = session;
    sessionCacheTime = now;
    return cachedSession;
  } catch (error) {
    console.error("세션 가져오기 실패:", error);
    return null;
  }
};

// 세션 캐시 클리어 함수
export const clearApiClientSessionCache = () => {
  cachedSession = null;
  sessionCacheTime = 0;
};

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getCachedSession();
    if (session?.accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리만 담당 (백엔드에서 이미 표준화된 응답 제공)
apiClient.interceptors.response.use(
  (response) => {
    // 백엔드에서 이미 {success, data, timestamp, path} 형태로 응답하므로 그대로 반환
    return response;
  },
  (error) => {
    // 에러 응답 처리
    if (error.response?.data) {
      const apiError = error.response.data as ApiResponse;
      const appError = ErrorHandler.handle(apiError);

      if (appError) {
        // 인증 에러는 전역 처리
        if (
          appError.type === "AUTHENTICATION" &&
          ["TOKEN_EXPIRED", "INVALID_TOKEN"].includes(appError.code)
        ) {
          if (appError.action) {
            appError.action();
          }
        }

        return Promise.reject(appError);
      }
    }

    // 네트워크 에러 등 처리
    const networkError = ErrorHandler.handleNetworkError(error);
    return Promise.reject(networkError);
  }
);

// === 타입 안전한 HTTP 메서드들 ===

/**
 * GET 요청 - 데이터 조회
 * @param url API 엔드포인트
 * @param config Axios 설정 (선택사항)
 * @returns Promise<T> - 응답 데이터
 */
const get = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> =>
  apiClient.get<T>(url, config).then((res: AxiosResponse<T>) => res.data);

/**
 * POST 요청 - 데이터 생성
 * @param url API 엔드포인트
 * @param data 요청 데이터 (선택사항)
 * @param config Axios 설정 (선택사항)
 * @returns Promise<T> - 응답 데이터
 */
const post = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> =>
  apiClient
    .post<T>(url, data, config)
    .then((res: AxiosResponse<T>) => res.data);

/**
 * PUT 요청 - 데이터 전체 수정
 * @param url API 엔드포인트
 * @param data 요청 데이터 (선택사항)
 * @param config Axios 설정 (선택사항)
 * @returns Promise<T> - 응답 데이터
 */
const put = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> =>
  apiClient.put<T>(url, data, config).then((res: AxiosResponse<T>) => res.data);

/**
 * PATCH 요청 - 데이터 부분 수정
 * @param url API 엔드포인트
 * @param data 요청 데이터 (선택사항)
 * @param config Axios 설정 (선택사항)
 * @returns Promise<T> - 응답 데이터
 */
const patch = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> =>
  apiClient
    .patch<T>(url, data, config)
    .then((res: AxiosResponse<T>) => res.data);

/**
 * DELETE 요청 - 데이터 삭제
 * @param url API 엔드포인트
 * @param config Axios 설정 (선택사항)
 * @returns Promise<T> - 응답 데이터
 */
const del = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> =>
  apiClient.delete<T>(url, config).then((res: AxiosResponse<T>) => res.data);

export { apiClient, get, post, put, patch, del };
