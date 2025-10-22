import { PushNotifications } from "@capacitor/push-notifications";

// 푸시 알림 권한 확인
export const checkNotificationPermissions = async () => {
  try {
    const perm = await PushNotifications.checkPermissions();
    return perm.receive === "granted";
  } catch (error) {
    console.error("알림 권한 확인 실패:", error);
    return false;
  }
};

// 푸시 알림 권한 요청
export const requestNotificationPermissions = async () => {
  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive === "granted") {
      await PushNotifications.register();
      return true;
    }
    return false;
  } catch (error) {
    console.error("알림 권한 요청 실패:", error);
    return false;
  }
};

// TODO: 캘린더 동기화 완료 후 알림 기능 구현 예정
// - 로컬 알림 스케줄링
// - 수업 시작 전 알림
// - 알림 취소 및 관리
