import { useState, useCallback } from "react";
import type { GalleryImageOptions } from "@capacitor/camera";
import {
  pickMultipleImages,
  getLimitedLibraryPhotos,
  updateLimitedLibraryPhotos,
  isMultipleSelectionSupported,
} from "@/capacitor/camera/galleryService";
import {
  checkPhotosPermission,
  requestPhotosPermission,
} from "@/capacitor/permissions/camera";
import { galleryPhotosToProcessedImages } from "@/capacitor/camera/imageProcessor";
import type { ProcessedImage } from "@/capacitor/camera/types";
import { toast } from "sonner";

interface UseGalleryOptions {
  /**
   * 최대 선택 가능 이미지 수
   * @default 10
   */
  maxSelection?: number;

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
  onSuccess?: (images: ProcessedImage[]) => void;

  /**
   * 에러 발생 시 콜백
   */
  onError?: (error: Error) => void;
}

interface UseGalleryReturn {
  /**
   * 여러 이미지 선택
   */
  pickMultiple: (
    options?: Partial<GalleryImageOptions>
  ) => Promise<ProcessedImage[]>;

  /**
   * iOS Limited Photos 가져오기
   */
  getLimitedPhotos: () => Promise<ProcessedImage[]>;

  /**
   * iOS Limited Photos 업데이트
   */
  updateLimitedPhotos: () => Promise<ProcessedImage[]>;

  /**
   * 다중 선택 지원 여부
   */
  isMultipleSupported: boolean;

  /**
   * 로딩 상태
   */
  isLoading: boolean;

  /**
   * 에러 정보
   */
  error: Error | null;

  /**
   * 선택된 이미지들
   */
  selectedImages: ProcessedImage[];

  /**
   * 선택된 이미지 초기화
   */
  clearImages: () => void;
}

/**
 * 갤러리 다중 선택을 위한 커스텀 훅
 *
 * @example
 * ```tsx
 * function PhotoUploadMultiple() {
 *   const { pickMultiple, selectedImages, isLoading } = useGallery({
 *     maxSelection: 5,
 *     onSuccess: (images) => uploadImagesToServer(images),
 *   });
 *
 *   return (
 *     <>
 *       <button onClick={() => pickMultiple()} disabled={isLoading}>
 *         사진 선택 (최대 5장)
 *       </button>
 *       <div>
 *         {selectedImages.map((img, i) => (
 *           <img key={i} src={img.webPath} />
 *         ))}
 *       </div>
 *     </>
 *   );
 * }
 * ```
 */
export function useGallery(options: UseGalleryOptions = {}): UseGalleryReturn {
  const {
    maxSelection = 10,
    autoRequestPermission = true,
    showErrorToast = true,
    onSuccess,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedImages, setSelectedImages] = useState<ProcessedImage[]>([]);

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

  const pickMultiple = useCallback(
    async (
      galleryOptions?: Partial<GalleryImageOptions>
    ): Promise<ProcessedImage[]> => {
      setIsLoading(true);
      setError(null);

      try {
        // 권한 확인
        if (autoRequestPermission) {
          const permission = await checkPhotosPermission();
          if (permission === "denied") {
            const requested = await requestPhotosPermission();
            if (requested === "denied") {
              throw new Error("사진 접근 권한이 필요합니다.");
            }
          }
        }

        const photos = await pickMultipleImages({
          limit: maxSelection,
          ...galleryOptions,
        });

        const processed = galleryPhotosToProcessedImages(photos);
        setSelectedImages(processed);
        onSuccess?.(processed);

        return processed;
      } catch (err) {
        handleError(err as Error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [autoRequestPermission, maxSelection, handleError, onSuccess]
  );

  const getLimitedPhotos = useCallback(async (): Promise<ProcessedImage[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const photos = await getLimitedLibraryPhotos();
      const processed = galleryPhotosToProcessedImages(photos);
      setSelectedImages(processed);
      return processed;
    } catch (err) {
      handleError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const updateLimitedPhotos = useCallback(async (): Promise<
    ProcessedImage[]
  > => {
    setIsLoading(true);
    setError(null);

    try {
      const photos = await updateLimitedLibraryPhotos();
      const processed = galleryPhotosToProcessedImages(photos);
      setSelectedImages(processed);
      return processed;
    } catch (err) {
      handleError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const clearImages = useCallback(() => {
    setSelectedImages([]);
    setError(null);
  }, []);

  return {
    pickMultiple,
    getLimitedPhotos,
    updateLimitedPhotos,
    isMultipleSupported: isMultipleSelectionSupported(),
    isLoading,
    error,
    selectedImages,
    clearImages,
  };
}
