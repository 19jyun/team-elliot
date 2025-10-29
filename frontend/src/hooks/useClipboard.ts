import { useState } from "react";
import { Clipboard } from "@capacitor/clipboard";
import { toast } from "sonner";

interface UseClipboardOptions {
  /**
   * 복사 성공 후 자동으로 상태를 리셋할 시간 (밀리초)
   * @default 2000
   */
  resetDelay?: number;
  /**
   * 복사 성공 시 실행될 콜백 함수
   */
  onSuccess?: (text: string) => void;
  /**
   * 복사 실패 시 실행될 콜백 함수
   */
  onError?: (error: Error) => void;
  /**
   * Toast 메시지 표시 여부
   * @default true
   */
  showToast?: boolean;
  /**
   * 복사 성공 시 표시할 메시지
   * @default "복사되었습니다"
   */
  successMessage?: string;
  /**
   * 복사 실패 시 표시할 메시지
   * @default "복사에 실패했습니다"
   */
  errorMessage?: string;
}

interface UseClipboardReturn {
  /**
   * 텍스트를 클립보드에 복사
   */
  copy: (text: string) => Promise<void>;
  /**
   * 클립보드에서 텍스트를 읽기
   */
  paste: () => Promise<string>;
  /**
   * 복사 성공 여부
   */
  isCopied: boolean;
  /**
   * 복사 중 여부
   */
  isLoading: boolean;
  /**
   * 에러 정보
   */
  error: Error | null;
}

/**
 * 클립보드 복사/붙여넣기 기능을 제공하는 커스텀 훅
 *
 * @capacitor/clipboard 플러그인을 사용하여 웹과 네이티브 앱 모두에서 작동합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용 (toast 자동 표시)
 * const { copy, isCopied } = useClipboard();
 * <button onClick={() => copy('복사할 텍스트')}>
 *   {isCopied ? '복사됨!' : '복사'}
 * </button>
 *
 * // 커스텀 메시지
 * const { copy } = useClipboard({
 *   successMessage: '계좌번호가 복사되었습니다',
 *   onSuccess: () => console.log('복사 완료!')
 * });
 *
 * // Toast 비활성화
 * const { copy } = useClipboard({ showToast: false });
 * ```
 */
export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const {
    resetDelay = 2000,
    onSuccess,
    onError,
    showToast = true,
    successMessage = "복사되었습니다",
    errorMessage = "복사에 실패했습니다",
  } = options;
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = async (text: string) => {
    if (!text) {
      const emptyError = new Error("복사할 텍스트가 비어있습니다.");
      setError(emptyError);
      onError?.(emptyError);
      if (showToast) {
        toast.error(emptyError.message);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Capacitor Clipboard 플러그인 사용
      await Clipboard.write({
        string: text,
      });

      setIsCopied(true);
      onSuccess?.(text);

      // Toast 메시지 표시
      if (showToast) {
        toast.success(successMessage);
      }

      // 지정된 시간 후 상태 리셋
      if (resetDelay > 0) {
        setTimeout(() => {
          setIsCopied(false);
        }, resetDelay);
      }
    } catch (err) {
      const copyError =
        err instanceof Error ? err : new Error("클립보드 복사에 실패했습니다.");

      setError(copyError);
      onError?.(copyError);

      // Toast 메시지 표시
      if (showToast) {
        toast.error(errorMessage);
      }

      console.error("클립보드 복사 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const paste = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await Clipboard.read();
      return result.value || "";
    } catch (err) {
      const pasteError =
        err instanceof Error ? err : new Error("클립보드 읽기에 실패했습니다.");

      setError(pasteError);
      onError?.(pasteError);
      console.error("클립보드 읽기 실패:", err);
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  return {
    copy,
    paste,
    isCopied,
    isLoading,
    error,
  };
}
