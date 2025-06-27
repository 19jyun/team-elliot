import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage or sessionStorage
    const token =
      (typeof window !== "undefined" && localStorage.getItem("token")) ||
      (typeof window !== "undefined" && sessionStorage.getItem("token"));
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper methods
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
