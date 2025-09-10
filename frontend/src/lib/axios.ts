import axios from "axios";
import { getSession } from "next-auth/react";
import { signOut } from "next-auth/react";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 세션 캐싱을 위한 변수
let cachedSession: unknown = null;
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
export const clearSessionCache = () => {
  cachedSession = null;
  sessionCacheTime = 0;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getCachedSession();
    if (
      session &&
      typeof session === "object" &&
      "accessToken" in session &&
      typeof session.accessToken === "string"
    ) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 특정 API 엔드포인트는 401 에러를 무시 (선생님 프로필 조회 등)
    const ignoreAuthEndpoints = [
      "/teachers/", // 선생님 프로필 조회 API
    ];

    const shouldIgnoreAuth = ignoreAuthEndpoints.some((endpoint) =>
      error.config?.url?.includes(endpoint)
    );

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !shouldIgnoreAuth
    ) {
      // 세션 만료 또는 권한 없음 (무시할 엔드포인트 제외)
      await signOut({ redirect: false });
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
