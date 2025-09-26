import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { SessionService } from "@/lib/services/SessionService";
import { ErrorHandler } from "@/lib/errorHandler";
import { ApiResponse } from "@/types/api";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// SessionService 인스턴스
const sessionService = new SessionService();

// 세션을 가져오는 함수 (캐싱 적용)
// 무한 루프 방지를 위해 직접 localStorage에서 세션을 가져옴
const getCachedSession = async () => {
  try {
    // SessionManager에서 직접 세션 가져오기 (API 호출 없이)
    const { SessionManager } = await import("@/lib/auth/AuthProvider");
    const session = SessionManager.get();
    return session;
  } catch (error) {
    console.error("세션 조회 실패:", error);
    return null;
  }
};

// 세션 캐시 클리어 함수
export const clearApiClientSessionCache = () => {
  sessionService.clearSession();
};

apiClient.interceptors.request.use(
  async (config) => {
    // 세션 조회 API는 토큰을 추가하지 않음 (무한 루프 방지)
    if (
      config.url?.includes("/auth/session") ||
      config.url?.includes("/auth/verify")
    ) {
      return config;
    }

    const session = await getCachedSession();
    if (session?.accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("요청 인터셉터 오류:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리만 담당 (백엔드에서 이미 표준화된 응답 제공)
apiClient.interceptors.response.use(
  (response) => {
    // 백엔드에서 이미 {success, data, timestamp, path} 형태로 응답하므로 그대로 반환
    return response;
  },
  (error) => {
    console.error("응답 인터셉터 오류:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

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
// const patch = <T = unknown, D = unknown>(
//   url: string,
//   data?: D,
//   config?: AxiosRequestConfig
// ): Promise<T> =>
//   apiClient
//     .patch<T>(url, data, config)
//     .then((res: AxiosResponse<T>) => res.data);
// 미사용되기 때문에 일단 주석처리

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

export { get, post, put, del };
