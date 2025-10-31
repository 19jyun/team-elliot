import { useState, useEffect, useCallback } from "react";
import {
  pushNotificationService,
  type PushNotificationStatus,
} from "@/services/pushNotificationService";

// 푸시 알림 훅
export function usePushNotification() {
  const [status, setStatus] = useState<PushNotificationStatus>(
    pushNotificationService.getStatus()
  );

  // 상태 업데이트
  const updateStatus = useCallback(() => {
    setStatus(pushNotificationService.getStatus());
  }, []);

  // 권한 확인 및 요청
  const checkAndRequestPermissions = useCallback(async () => {
    try {
      const hasPermission = await pushNotificationService.checkPermissions();
      if (!hasPermission) {
        const granted = await pushNotificationService.requestPermissions();
        if (granted) {
          // 권한이 있으면 자동으로 등록 시도
          await pushNotificationService.register();
          updateStatus();
          return true;
        }
        return false;
      }
      // 권한이 이미 있으면 등록 시도
      await pushNotificationService.register();
      updateStatus();
      return true;
    } catch (error) {
      console.error("권한 확인/요청 실패:", error);
      updateStatus();
      return false;
    }
  }, [updateStatus]);

  // 푸시 알림 등록
  const register = useCallback(async () => {
    try {
      const success = await pushNotificationService.register();
      updateStatus();
      return success;
    } catch (error) {
      console.error("푸시 알림 등록 실패:", error);
      updateStatus();
      return false;
    }
  }, [updateStatus]);

  // 전달된 알림 목록 가져오기
  const getDeliveredNotifications = useCallback(async () => {
    try {
      return await pushNotificationService.getDeliveredNotifications();
    } catch (error) {
      console.error("전달된 알림 목록 조회 실패:", error);
      return [];
    }
  }, []);

  // 알림 활성화/비활성화
  const setEnabled = useCallback(
    (enabled: boolean) => {
      pushNotificationService.setUserEnabled(enabled);
      updateStatus();

      // 활성화 시 자동으로 등록 시도
      if (enabled) {
        pushNotificationService.register().then(() => {
          updateStatus();
        });
      }
    },
    [updateStatus]
  );

  // 에러 초기화
  const clearError = useCallback(() => {
    pushNotificationService.clearError();
    updateStatus();
  }, [updateStatus]);

  // 토큰 가져오기
  const getToken = useCallback(() => {
    return pushNotificationService.getToken();
  }, []);

  // 초기 로드 시 리스너 추가
  useEffect(() => {
    if (status.isEnabled) {
      pushNotificationService.addListeners().then(() => {
        updateStatus();
      });
    }
  }, [status.isEnabled, updateStatus]);

  return {
    // 상태
    status,

    // 액션
    register,
    checkAndRequestPermissions,
    getDeliveredNotifications,
    setEnabled,
    clearError,
    getToken,

    // 헬퍼
    updateStatus,
  };
}
