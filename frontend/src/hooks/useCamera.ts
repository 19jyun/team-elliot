import { useState, useCallback } from "react";
import { CameraSource } from "@capacitor/camera";
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
import { photoToProcessedImage } from "@/capacitor/camera/imageProcessor";
import type { ProcessedImage } from "@/capacitor/camera/types";
import { toast } from "sonner";

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
    (photo: Photo) => {
      const processed = photoToProcessedImage(photo);
      setSelectedImage(processed);
      onSuccess?.(processed);
      return processed;
    },
    [onSuccess]
  );

  const capture = useCallback(
    async (imageOptions?: Partial<ImageOptions>): Promise<ProcessedImage | null> => {
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
    async (imageOptions?: Partial<ImageOptions>): Promise<ProcessedImage | null> => {
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
    async (imageOptions?: Partial<ImageOptions>): Promise<ProcessedImage | null> => {
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

  return {
    capture,
    pickFromGallery,
    pickWithPrompt,
    isSupported: isCameraSupported(),
    isLoading,
    error,
    selectedImage,
    clearImage,
  };
}
