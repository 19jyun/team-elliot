import type {
  Photo,
  GalleryPhotos,
  ImageOptions,
  GalleryImageOptions,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";

// 재사용 가능한 타입 정의
export type { Photo, GalleryPhotos, ImageOptions, GalleryImageOptions };

export { CameraResultType, CameraSource };

// 앱 전용 확장 타입 - interface 대신 type 사용
export type CameraOptions = ImageOptions;

export type GalleryOptions = GalleryImageOptions;

/**
 * 처리된 이미지 정보
 */
export interface ProcessedImage {
  /** 파일 시스템 URI */
  uri: string;
  /** 웹에서 사용 가능한 경로 */
  webPath: string;
  /** 이미지 포맷 (jpeg, png, gif 등) */
  format: string;
  /** Base64 인코딩 문자열 (옵션) */
  base64?: string;
  /** EXIF 메타데이터 (옵션) */
  exif?: Record<string, unknown>;
}
