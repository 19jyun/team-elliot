import axiosInstance from "@/lib/axios";

/**
 * 이미지 URL을 백엔드 서버 URL로 변환하는 유틸리티 함수
 * @param imageUrl - 상대 경로 또는 전체 URL
 * @returns 백엔드 서버의 전체 이미지 URL
 */
export const getImageUrl = (imageUrl?: string | null): string | null => {
  if (!imageUrl) return null;

  // 이미 전체 URL인 경우 그대로 반환
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // axiosInstance의 baseURL을 사용하여 백엔드 서버 URL 가져오기
  const backendUrl = axiosInstance.defaults.baseURL || "http://localhost:3001";
  const fullUrl = `${backendUrl}${imageUrl}`;

  return fullUrl;
};
