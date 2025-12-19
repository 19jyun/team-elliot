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
