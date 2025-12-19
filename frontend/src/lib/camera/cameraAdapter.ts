/**
 * 환경별 Camera 어댑터
 * Capacitor 환경에서는 Capacitor Camera 사용
 * 웹 환경에서는 HTML5 File Input 사용
 */

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import type { Photo, ImageOptions } from "@capacitor/camera";

// Capacitor 환경 감지
const isCapacitor = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * 통합 Camera 인터페이스
 */
export interface CameraAdapter {
  /**
   * 사진 촬영 또는 선택
   */
  getPhoto(options: ImageOptions): Promise<Photo>;

  /**
   * 지원 여부 확인
   */
  isSupported(): boolean;
}

/**
 * Capacitor Camera 어댑터
 */
class CapacitorCameraAdapter implements CameraAdapter {
  async getPhoto(options: ImageOptions): Promise<Photo> {
    try {
      return await Camera.getPhoto(options);
    } catch (error) {
      console.error("Capacitor Camera error:", error);
      throw new Error("사진을 가져올 수 없습니다.");
    }
  }

  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }
}

/**
 * Browser File Input 기반 Camera 어댑터
 */
class BrowserCameraAdapter implements CameraAdapter {
  // 선택된 원본 파일을 보관 (업로드용)
  private originalFile: File | null = null;

  private createFileInput(accept: string, capture?: boolean): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    if (capture && "capture" in HTMLInputElement.prototype) {
      input.setAttribute("capture", "environment");
    }
    input.style.display = "none";
    return input;
  }

  private fileToPhoto(
    file: File,
    resultType: CameraResultType
  ): Promise<Photo> {
    // 원본 파일 보관
    this.originalFile = file;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;

        // 포맷 추출
        const format = file.type.split("/")[1] || "jpeg";

        if (resultType === CameraResultType.Base64) {
          // Base64에서 data URL 프리픽스 제거
          const base64String = result.split(",")[1];
          resolve({
            base64String,
            dataUrl: result,
            format,
          } as Photo);
        } else if (resultType === CameraResultType.DataUrl) {
          resolve({
            dataUrl: result,
            format,
          } as Photo);
        } else {
          // Uri - Blob URL 생성
          const blob = new Blob([file], { type: file.type });
          const webPath = URL.createObjectURL(blob);
          resolve({
            webPath,
            format,
          } as Photo);
        }
      };

      reader.onerror = () => {
        reject(new Error("파일을 읽을 수 없습니다."));
      };

      if (
        resultType === CameraResultType.Base64 ||
        resultType === CameraResultType.DataUrl
      ) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  async getPhoto(options: ImageOptions): Promise<Photo> {
    return new Promise((resolve, reject) => {
      const {
        source = CameraSource.Prompt,
        resultType = CameraResultType.Uri,
      } = options;

      // 이미지 파일만 허용
      const accept = "image/*";

      // 카메라 촬영 요청 시 capture 속성 사용
      const shouldCapture = source === CameraSource.Camera;

      const input = this.createFileInput(accept, shouldCapture);

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) {
          reject(new Error("파일이 선택되지 않았습니다."));
          document.body.removeChild(input);
          return;
        }

        // 파일 타입 검증
        if (!file.type.startsWith("image/")) {
          reject(new Error("이미지 파일만 선택할 수 있습니다."));
          document.body.removeChild(input);
          return;
        }

        try {
          const photo = await this.fileToPhoto(file, resultType);
          resolve(photo);
        } catch (error) {
          reject(error);
        } finally {
          document.body.removeChild(input);
        }
      };

      input.oncancel = () => {
        reject(new Error("사진 선택이 취소되었습니다."));
        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      "FileReader" in window
    );
  }
}

/**
 * 환경에 따른 Camera 어댑터 팩토리
 */
export const createCameraAdapter = (): CameraAdapter => {
  if (isCapacitor()) {
    return new CapacitorCameraAdapter();
  }
  return new BrowserCameraAdapter();
};

/**
 * 전역 Camera 어댑터 인스턴스
 */
export const cameraAdapter = createCameraAdapter();

/**
 * ProcessedImage 또는 Photo의 webPath에서 File 객체 가져오기
 * 브라우저 환경에서 Blob URL을 File로 변환
 */
export async function webPathToFile(
  webPath: string,
  filename: string = "photo.jpg"
): Promise<File> {
  try {
    const response = await fetch(webPath);
    const blob = await response.blob();

    // MIME 타입 추출
    const mimeType = blob.type || "image/jpeg";

    // Blob을 File로 변환
    const file = new File([blob], filename, { type: mimeType });
    return file;
  } catch (error) {
    console.error("webPath를 File로 변환 실패:", error);
    throw new Error("이미지를 처리할 수 없습니다.");
  }
}
