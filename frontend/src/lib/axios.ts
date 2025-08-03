import axios from "axios";
import { getSession } from "next-auth/react";
import { signOut } from "next-auth/react";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
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
