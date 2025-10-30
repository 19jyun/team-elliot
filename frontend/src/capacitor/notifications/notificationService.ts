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

// 리스너 추가 (예시 코드 기반)
export const addListeners = async () => {
  try {
    await PushNotifications.addListener("registration", (token) => {
      console.info("Registration token: ", token.value);
    });

    await PushNotifications.addListener("registrationError", (err) => {
      console.error("Registration error: ", err.error);
    });

    await PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push notification received: ", notification);
      }
    );

    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        console.log(
          "Push notification action performed",
          notification.actionId,
          notification.inputValue
        );
      }
    );
  } catch (error) {
    console.error("리스너 추가 실패:", error);
  }
};

// 푸시 알림 등록 (예시 코드 기반)
export const registerNotifications = async () => {
  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      throw new Error("User denied permissions!");
    }

    await PushNotifications.register();
  } catch (error) {
    console.error("푸시 알림 등록 실패:", error);
    throw error;
  }
};

// 전달된 알림 목록 가져오기 (예시 코드 기반)
export const getDeliveredNotifications = async () => {
  try {
    const notificationList =
      await PushNotifications.getDeliveredNotifications();
    console.log("delivered notifications", notificationList);
    return notificationList;
  } catch (error) {
    console.error("전달된 알림 목록 조회 실패:", error);
    return { notifications: [] };
  }
};
