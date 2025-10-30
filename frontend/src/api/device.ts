import { post, del } from "./apiClient";
import type { ApiResponse } from "@/types/api";

export interface RegisterDeviceRequest {
  token: string;
  platform: "ios" | "android";
}

export interface UnregisterDeviceRequest {
  token: string;
}

export interface DeviceTokenResponse {
  id: number;
  userId: number;
  token: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 디바이스 토큰 등록
export const registerDevice = (
  data: RegisterDeviceRequest
): Promise<ApiResponse<DeviceTokenResponse>> => {
  return post<ApiResponse<DeviceTokenResponse>>("/devices/register", data);
};

// 디바이스 토큰 해제
export const unregisterDevice = (
  data: UnregisterDeviceRequest
): Promise<ApiResponse<void>> => {
  return del<ApiResponse<void>>("/devices/unregister", { data });
};
