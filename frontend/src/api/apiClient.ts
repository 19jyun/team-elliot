import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
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
