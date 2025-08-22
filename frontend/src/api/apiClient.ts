import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";
import { ErrorHandler } from "@/lib/errorHandler";
import { ApiResponse, AppError } from "@/types/api";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 세션 캐싱을 위한 변수
let cachedSession: any = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5분

// 세션을 가져오는 함수 (캐싱 적용)
const getCachedSession = async () => {
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
    return session;
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

// 응답 인터셉터 - 에러 처리 및 응답 표준화
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답을 표준화된 형태로 변환
    return {
      ...response,
      data: {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
      },
    };
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

const get = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiClient.get<T>(url, config).then((res: AxiosResponse<T>) => res.data);

const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiClient
    .post<T>(url, data, config)
    .then((res: AxiosResponse<T>) => res.data);

const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiClient.put<T>(url, data, config).then((res: AxiosResponse<T>) => res.data);

const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiClient
    .patch<T>(url, data, config)
    .then((res: AxiosResponse<T>) => res.data);

const del = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiClient.delete<T>(url, config).then((res: AxiosResponse<T>) => res.data);

export { apiClient, get, post, put, patch, del };
