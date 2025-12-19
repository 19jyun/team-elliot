import { Camera } from "@capacitor/camera";
import type { GalleryPhotos, GalleryImageOptions } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

/**
 * 갤러리에서 여러 이미지 선택
 */
export async function pickMultipleImages(
  options?: Partial<GalleryImageOptions>
): Promise<GalleryPhotos> {
  const defaultOptions: GalleryImageOptions = {
    quality: 90,
    limit: 10, // 최대 10장
    correctOrientation: true,
    ...options,
  };

  try {
    // iOS 13 이하에서는 단일 선택만 가능
    return await Camera.pickImages(defaultOptions);
  } catch (error) {
    console.error("다중 이미지 선택 실패:", error);
    throw new Error("이미지 선택에 실패했습니다.");
  }
}

/**
 * iOS 14+ Limited Photos 관리
 */
export async function getLimitedLibraryPhotos(): Promise<GalleryPhotos> {
  if (Capacitor.getPlatform() !== "ios") {
    console.warn("Limited library photos는 iOS 14+ 전용입니다.");
    return { photos: [] };
  }

  try {
    return await Camera.getLimitedLibraryPhotos();
  } catch (error) {
    console.error("Limited photos 가져오기 실패:", error);
    return { photos: [] };
  }
}

/**
 * iOS 14+ Limited Photos 선택 업데이트
 */
export async function updateLimitedLibraryPhotos(): Promise<GalleryPhotos> {
  if (Capacitor.getPlatform() !== "ios") {
    console.warn("Limited library update는 iOS 14+ 전용입니다.");
    return { photos: [] };
  }

  try {
    return await Camera.pickLimitedLibraryPhotos();
  } catch (error) {
    console.error("Limited photos 업데이트 실패:", error);
    return { photos: [] };
  }
}

/**
 * 다중 선택 지원 여부 확인
 */
export function isMultipleSelectionSupported(): boolean {
  // iOS 14+, Android 모든 버전 지원
  const platform = Capacitor.getPlatform();
  return platform === "android" || platform === "ios";
}
