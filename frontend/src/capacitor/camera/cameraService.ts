import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import type { Photo, ImageOptions } from "@capacitor/camera";

/**
 * 카메라로 사진 촬영
 */
export async function takePicture(
  options?: Partial<ImageOptions>
): Promise<Photo> {
  const defaultOptions: ImageOptions = {
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    correctOrientation: true,
    saveToGallery: false,
    ...options,
  };

  try {
    return await Camera.getPhoto(defaultOptions);
  } catch (error) {
    console.error("사진 촬영 실패:", error);
    throw new Error("사진 촬영에 실패했습니다.");
  }
}

/**
 * 갤러리에서 사진 선택 (단일)
 */
export async function pickImageFromGallery(
  options?: Partial<ImageOptions>
): Promise<Photo> {
  const defaultOptions: ImageOptions = {
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    ...options,
  };

  try {
    return await Camera.getPhoto(defaultOptions);
  } catch (error) {
    console.error("갤러리 이미지 선택 실패:", error);
    throw new Error("이미지 선택에 실패했습니다.");
  }
}

/**
 * 사용자에게 선택 프롬프트 표시 (카메라 or 갤러리)
 */
export async function pickImageWithPrompt(
  options?: Partial<ImageOptions>
): Promise<Photo> {
  const defaultOptions: ImageOptions = {
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt,
    promptLabelHeader: "사진",
    promptLabelCancel: "취소",
    promptLabelPhoto: "갤러리에서 선택",
    promptLabelPicture: "사진 촬영",
    ...options,
  };

  try {
    return await Camera.getPhoto(defaultOptions);
  } catch (error) {
    console.error("이미지 선택 실패:", error);
    throw new Error("이미지 선택에 실패했습니다.");
  }
}

/**
 * Base64로 이미지 가져오기 (업로드용)
 */
export async function getImageAsBase64(
  source: CameraSource,
  options?: Partial<ImageOptions>
): Promise<Photo> {
  return await Camera.getPhoto({
    quality: 80,
    resultType: CameraResultType.Base64,
    source,
    ...options,
  });
}

/**
 * 플랫폼별 Camera 지원 여부 확인
 */
export function isCameraSupported(): boolean {
  return (
    Capacitor.isNativePlatform() ||
    (typeof navigator !== "undefined" &&
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices)
  );
}
