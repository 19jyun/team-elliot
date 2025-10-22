import { PushNotifications } from "@capacitor/push-notifications";

// 푸시 알림 등록
export const registerForPushNotifications = async () => {
  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive === "granted") {
      await PushNotifications.register();
      return true;
    }
    return false;
  } catch (error) {
    console.error("푸시 알림 등록 실패:", error);
    return false;
  }
};

// 로컬 알림 스케줄링
export const scheduleLocalNotification = async (notification: {
  title: string;
  body: string;
  id?: number;
  schedule?: {
    at: Date;
  };
  sound?: string;
  attachments?: Array<{
    id: string;
    url: string;
    options?: any;
  }>;
  actionTypeId?: string;
  extra?: any;
}) => {
  try {
    const result = await PushNotifications.schedule({
      notifications: [notification],
    });
    return result;
  } catch (error) {
    console.error("로컬 알림 스케줄링 실패:", error);
    throw error;
  }
};

// 예약된 알림 조회
export const getPendingNotifications = async () => {
  try {
    const result = await PushNotifications.getPending();
    return result.notifications;
  } catch (error) {
    console.error("예약된 알림 조회 실패:", error);
    return [];
  }
};

// 특정 알림 취소
export const cancelNotification = async (notificationId: number) => {
  try {
    await PushNotifications.cancel({ notifications: [{ id: notificationId }] });
  } catch (error) {
    console.error("알림 취소 실패:", error);
    throw error;
  }
};

// 모든 예약된 알림 취소
export const cancelAllNotifications = async () => {
  try {
    await PushNotifications.cancelAll();
  } catch (error) {
    console.error("모든 알림 취소 실패:", error);
    throw error;
  }
};

// 수업 시작 전 알림 스케줄링 (예시)
export const scheduleClassReminder = async (classInfo: {
  className: string;
  startTime: Date;
  teacherName: string;
  classId: number;
}) => {
  const reminderTime = new Date(classInfo.startTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30분 전 알림

  return await scheduleLocalNotification({
    title: "수업 시작 30분 전",
    body: `${classInfo.className} 수업이 곧 시작됩니다. (${classInfo.teacherName} 선생님)`,
    id: classInfo.classId,
    schedule: {
      at: reminderTime,
    },
    sound: "default",
    extra: {
      classId: classInfo.classId,
      type: "class_reminder",
    },
  });
};
