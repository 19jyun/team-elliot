import { useState, useCallback } from "react";
import { CameraResultType } from "@capacitor/camera";
import type { Photo, ImageOptions } from "@capacitor/camera";
import {
  takePicture,
  pickImageFromGallery,
  pickImageWithPrompt,
  isCameraSupported,
} from "@/capacitor/camera/cameraService";
import {
  checkCameraPermission,
  requestCameraPermission,
} from "@/capacitor/permissions/camera";
import {
  photoToProcessedImage,
  validateProfilePhoto,
  processedImageToFile,
} from "@/capacitor/camera/imageProcessor";
import type { ProcessedImage } from "@/capacitor/camera/types";
import { toast } from "sonner";

/**
 * 프로필 사진용 사전 설정된 옵션
 * Backend 요구사항 준수:
 * - 최대 크기: 5MB
 * - 허용 포맷: jpeg, png, gif, webp
 * - 권장 크기: 800x800
 */
export const PROFILE_PHOTO_OPTIONS: Partial<ImageOptions> = {
  quality: 90,
  allowEditing: true, // 사용자가 크롭 가능
  resultType: CameraResultType.Uri,
  correctOrientation: true,
  saveToGallery: false,
  width: 800, // 최대 너비 제한
  height: 800, // 최대 높이 제한
};

interface UseCameraOptions {
  /**
   * 권한 자동 요청 여부
   * @default true
   */
  autoRequestPermission?: boolean;

  /**
   * 에러 발생 시 토스트 표시 여부
   * @default true
   */
  showErrorToast?: boolean;

  /**
   * 이미지 선택 성공 시 콜백
   */
  onSuccess?: (image: ProcessedImage) => void;

  /**
   * 에러 발생 시 콜백
   */
  onError?: (error: Error) => void;
}

interface UseCameraReturn {
  /**
   * 카메라로 사진 촬영
   */
  capture: (options?: Partial<ImageOptions>) => Promise<ProcessedImage | null>;

  /**
   * 갤러리에서 이미지 선택
   */
  pickFromGallery: (
    options?: Partial<ImageOptions>
  ) => Promise<ProcessedImage | null>;

  /**
   * 프롬프트로 선택 (카메라 or 갤러리)
   */
  pickWithPrompt: (
    options?: Partial<ImageOptions>
  ) => Promise<ProcessedImage | null>;

  /**
   * 프로필 사진용 카메라 촬영 (검증 포함)
   */
  captureProfilePhoto: (
    options?: Partial<ImageOptions>
  ) => Promise<ProcessedImage | null>;

  /**
   * 프로필 사진용 갤러리 선택 (검증 포함)
   */
  pickProfilePhotoFromGallery: (
    options?: Partial<ImageOptions>
  ) => Promise<ProcessedImage | null>;

  /**
   * 프로필 사진용 프롬프트 선택 (검증 포함)
   */
  pickProfilePhotoWithPrompt: (
    options?: Partial<ImageOptions>
  ) => Promise<ProcessedImage | null>;

  /**
   * 카메라 지원 여부
   */
  isSupported: boolean;

  /**
   * 로딩 상태
   */
  isLoading: boolean;

  /**
   * 에러 정보
   */
  error: Error | null;

  /**
   * 선택된 이미지
   */
  selectedImage: ProcessedImage | null;

  /**
   * 선택된 이미지 초기화
   */
  clearImage: () => void;

  /**
   * 선택된 이미지를 File 객체로 변환 (업로드용)
   * @param imageOrFilename - ProcessedImage 객체 또는 파일명
   * @param filename - imageOrFilename이 ProcessedImage일 때 사용할 파일명
   */
  getImageAsFile: (
    imageOrFilename?: ProcessedImage | string,
    filename?: string
  ) => Promise<File | null>;
}

/**
 * 카메라 및 갤러리 접근을 위한 커스텀 훅
 *
 * @example
 * ```tsx
 * function ProfilePhotoUpload() {
 *   const { capture, pickFromGallery, pickWithPrompt, selectedImage } = useCamera({
 *     onSuccess: (image) => uploadToServer(image),
 *   });
 *
 *   return (
 *     <>
 *       <button onClick={() => capture()}>사진 촬영</button>
 *       <button onClick={() => pickFromGallery()}>갤러리</button>
 *       <button onClick={() => pickWithPrompt()}>선택</button>
 *       {selectedImage && <img src={selectedImage.webPath} />}
 *     </>
 *   );
 * }
 * ```
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    autoRequestPermission = true,
    showErrorToast = true,
    onSuccess,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(
    null
  );

  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      if (showErrorToast) {
        toast.error(err.message);
      }
      onError?.(err);
    },
    [showErrorToast, onError]
  );

  const handleSuccess = useCallback(
    (photo: Photo, validateForProfile: boolean = false) => {
      // 프로필 사진 검증 (옵션)
      if (validateForProfile) {
        const validation = validateProfilePhoto(photo);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      const processed = photoToProcessedImage(photo);
      setSelectedImage(processed);
      onSuccess?.(processed);
      return processed;
    },
    [onSuccess]
  );

  const capture = useCallback(
    async (
      imageOptions?: Partial<ImageOptions>
    ): Promise<ProcessedImage | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // 권한 확인
        if (autoRequestPermission) {
          const permission = await checkCameraPermission();
          if (permission !== "granted") {
            const requested = await requestCameraPermission();
            if (requested !== "granted") {
              throw new Error("카메라 권한이 필요합니다.");
            }
          }
        }

        const photo = await takePicture(imageOptions);
        return handleSuccess(photo);
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [autoRequestPermission, handleError, handleSuccess]
  );

  const pickFromGallery = useCallback(
    async (
      imageOptions?: Partial<ImageOptions>
    ): Promise<ProcessedImage | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const photo = await pickImageFromGallery(imageOptions);
        return handleSuccess(photo);
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, handleSuccess]
  );

  const pickWithPrompt = useCallback(
    async (
      imageOptions?: Partial<ImageOptions>
    ): Promise<ProcessedImage | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const photo = await pickImageWithPrompt(imageOptions);
        return handleSuccess(photo);
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, handleSuccess]
  );

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setError(null);
  }, []);

  // 프로필 사진용 특화 함수들
  const captureProfilePhoto = useCallback(
    async (
      additionalOptions?: Partial<ImageOptions>
    ): Promise<ProcessedImage | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // 권한 확인
        if (autoRequestPermission) {
          const permission = await checkCameraPermission();
          if (permission !== "granted") {
            const requested = await requestCameraPermission();
            if (requested !== "granted") {
              throw new Error("카메라 권한이 필요합니다.");
            }
          }
        }

        const photo = await takePicture({
          ...PROFILE_PHOTO_OPTIONS,
          ...additionalOptions,
        });
        return handleSuccess(photo, true); // 프로필 사진 검증 활성화
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [autoRequestPermission, handleError, handleSuccess]
  );

  const pickProfilePhotoFromGallery = useCallback(
    async (
      additionalOptions?: Partial<ImageOptions>
    ): Promise<ProcessedImage | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const photo = await pickImageFromGallery({
          ...PROFILE_PHOTO_OPTIONS,
          ...additionalOptions,
        });
        return handleSuccess(photo, true); // 프로필 사진 검증 활성화
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, handleSuccess]
  );

  const pickProfilePhotoWithPrompt = useCallback(
    async (
      additionalOptions?: Partial<ImageOptions>
    ): Promise<ProcessedImage | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const photo = await pickImageWithPrompt({
          ...PROFILE_PHOTO_OPTIONS,
          promptLabelHeader: "프로필 사진",
          promptLabelCancel: "취소",
          promptLabelPhoto: "갤러리에서 선택",
          promptLabelPicture: "사진 촬영",
          ...additionalOptions,
        });
        return handleSuccess(photo, true); // 프로필 사진 검증 활성화
      } catch (err) {
        handleError(err as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, handleSuccess]
  );

  const getImageAsFile = useCallback(
    async (
      imageOrFilename?: ProcessedImage | string,
      filename?: string
    ): Promise<File | null> => {
      // Determine which image to use and filename
      let imageToConvert: ProcessedImage | null;
      let finalFilename: string | undefined;

      if (!imageOrFilename) {
        // No parameter: use current selectedImage state
        imageToConvert = selectedImage;
      } else if (typeof imageOrFilename === "string") {
        // String parameter: it's a filename, use selectedImage
        imageToConvert = selectedImage;
        finalFilename = imageOrFilename;
      } else {
        // ProcessedImage parameter: use it directly (fresh data)
        imageToConvert = imageOrFilename;
        finalFilename = filename;
      }

      if (!imageToConvert) {
        return null;
      }

      try {
        return await processedImageToFile(imageToConvert, finalFilename);
      } catch (err) {
        console.error("이미지를 File로 변환 실패:", err);
        handleError(err as Error);
        return null;
      }
    },
    [selectedImage, handleError]
  );

  return {
    capture,
    pickFromGallery,
    pickWithPrompt,
    captureProfilePhoto,
    pickProfilePhotoFromGallery,
    pickProfilePhotoWithPrompt,
    isSupported: isCameraSupported(),
    isLoading,
    error,
    selectedImage,
    clearImage,
    getImageAsFile,
  };
}
