import type { Photo, GalleryPhotos } from "@capacitor/camera";
import type { ProcessedImage } from "./types";

/**
 * Photo를 ProcessedImage로 변환
 */
export function photoToProcessedImage(photo: Photo): ProcessedImage {
  return {
    uri: photo.path || photo.webPath || "",
    webPath: photo.webPath || "",
    format: photo.format || "jpeg",
    base64: photo.base64String,
    exif: photo.exif as Record<string, unknown> | undefined,
  };
}

/**
 * GalleryPhotos를 ProcessedImage 배열로 변환
 */
export function galleryPhotosToProcessedImages(
  galleryPhotos: GalleryPhotos
): ProcessedImage[] {
  return galleryPhotos.photos.map((photo) => ({
    uri: photo.path || photo.webPath || "",
    webPath: photo.webPath || "",
    format: photo.format || "jpeg",
    exif: photo.exif as Record<string, unknown> | undefined,
  }));
}

/**
 * Base64에서 Blob 생성 (업로드용)
 */
export function base64ToBlob(
  base64: string,
  mimeType: string = "image/jpeg"
): Blob {
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeType });
}

/**
 * 이미지 크기 제한 체크
 */
export function validateImageSize(
  photo: Photo,
  maxSizeMB: number = 10
): boolean {
  if (!photo.base64String) return true;

  // Base64 문자열 크기를 바이트로 변환
  const sizeInBytes = (photo.base64String.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  return sizeInMB <= maxSizeMB;
}

/**
 * 이미지 MIME 타입 추출
 */
export function getImageMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };

  return mimeTypes[format.toLowerCase()] || "image/jpeg";
}

/**
 * ProcessedImage를 File 객체로 변환 (업로드용)
 * 브라우저와 Capacitor 환경 모두 지원
 */
export async function processedImageToFile(
  image: ProcessedImage,
  filename?: string
): Promise<File> {
  const { webPathToFile } = await import("@/lib/camera/cameraAdapter");

  // 파일명 생성 (제공되지 않은 경우)
  const finalFilename =
    filename || `photo-${Date.now()}.${image.format || "jpg"}`;

  // webPath가 있으면 Blob URL에서 File 생성
  if (image.webPath) {
    return await webPathToFile(image.webPath, finalFilename);
  }

  // base64가 있으면 base64에서 File 생성
  if (image.base64) {
    const mimeType = getImageMimeType(image.format);
    const blob = base64ToBlob(image.base64, mimeType);
    return new File([blob], finalFilename, { type: mimeType });
  }

  throw new Error("이미지 데이터를 찾을 수 없습니다.");
}

/**
 * 프로필 사진용 검증 (Backend 요구사항 준수)
 * - 최대 크기: 5MB
 * - 허용 포맷: jpeg, jpg, png, gif, webp
 */
export function validateProfilePhoto(photo: Photo): {
  valid: boolean;
  error?: string;
} {
  // 크기 검증 (5MB)
  if (!validateImageSize(photo, 5)) {
    return {
      valid: false,
      error: "파일 크기는 5MB 이하여야 합니다.",
    };
  }

  // 포맷 검증
  const allowedFormats = ["jpeg", "jpg", "png", "gif", "webp"];
  if (photo.format && !allowedFormats.includes(photo.format.toLowerCase())) {
    return {
      valid: false,
      error: `지원하지 않는 형식입니다. (${allowedFormats.join(", ")} 허용)`,
    };
  }

  return { valid: true };
}
