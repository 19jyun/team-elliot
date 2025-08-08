import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";

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

// 401 에러 로깅만 수행
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "401 Unauthorized - 토큰이 만료되었거나 인증에 실패했습니다."
      );
    }
    return Promise.reject(error);
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
