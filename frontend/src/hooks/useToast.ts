import { toast } from "sonner";

export const useToast = () => {
  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "info":
      default:
        toast.info(message);
        break;
    }
  };

  return { showToast };
};

// 전역 Toast 함수들 (apiClient에서 직접 사용)
export const showNetworkErrorToast = (message: string) => {
  toast.error(message, {
    duration: 5000,
    description: "잠시 후 다시 시도해주세요.",
  });
};

export const showServerErrorToast = (message: string) => {
  toast.error(message, {
    duration: 4000,
    description: "서버와의 연결을 확인해주세요.",
  });
};

export const showConnectionTimeoutToast = () => {
  toast.warning("서버와의 연결이 지연되고 있습니다.", {
    duration: 6000,
    description: "잠시 후 다시 시도해주세요.",
  });
};
