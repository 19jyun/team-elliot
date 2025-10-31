import { post, patch, del } from "./apiClient";
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

export interface DeviceOperationResponse {
  success: boolean;
  count: number;
  message: string;
}

// 디바이스 토큰 등록 (토글 ON, 로그인 시)
export const registerDevice = (
  data: RegisterDeviceRequest
): Promise<ApiResponse<DeviceTokenResponse>> => {
  return post<ApiResponse<DeviceTokenResponse>>("/devices/register", data);
};

// 디바이스 토큰 비활성화 (토글 OFF)
export const deactivateDevice = (
  data: UnregisterDeviceRequest
): Promise<ApiResponse<DeviceOperationResponse>> => {
  return patch<ApiResponse<DeviceOperationResponse>>(
    "/devices/deactivate",
    data
  );
};

// 디바이스 토큰 완전 삭제 (로그아웃)
export const unregisterDevice = (
  data: UnregisterDeviceRequest
): Promise<ApiResponse<DeviceOperationResponse>> => {
  return del<ApiResponse<DeviceOperationResponse>>("/devices/unregister", {
    data,
  });
};
