import { PushNotifications, Channel } from "@capacitor/push-notifications";
import {
  checkNotificationPermissions,
  requestNotificationPermissions,
} from "@/capacitor/notifications/notificationService";
import {
  registerDevice,
  deactivateDevice,
  unregisterDevice,
} from "@/api/device";
import { SessionManager } from "@/lib/auth/AuthProvider";
import { Capacitor } from "@capacitor/core";

// 푸시 알림 상태
export interface PushNotificationStatus {
  isEnabled: boolean;
  isRegistered: boolean;
  token: string | null;
  lastRegisterTime: Date | null;
  error: string | null;
}

// 푸시 알림 서비스
class PushNotificationService {
  private status: PushNotificationStatus = {
    isEnabled: false,
    isRegistered: false,
    token: null,
    lastRegisterTime: null,
    error: null,
  };

  // 사용자 설정 상태 관리
  private userSettings = {
    isUserEnabled: false,
    hasRequestedPermission: false,
  };

  // 리스너 등록 여부
  private listenersAdded = false;

  constructor() {
    // 로컬 스토리지에서 사용자 설정 로드
    this.loadUserSettings();
    // 저장된 토큰 로드
    this.loadToken();
  }

  // 사용자 설정 로드
  private loadUserSettings(): void {
    try {
      const stored = localStorage.getItem("pushNotificationSettings");
      if (stored) {
        const settings = JSON.parse(stored);
        this.userSettings = {
          isUserEnabled: settings.isUserEnabled || false,
          hasRequestedPermission: settings.hasRequestedPermission || false,
        };
        this.status.isEnabled = this.userSettings.isUserEnabled;
      }
    } catch (error) {
      console.error("푸시 알림 설정 로드 실패:", error);
    }
  }

  // 사용자 설정 저장
  private saveUserSettings(): void {
    try {
      localStorage.setItem(
        "pushNotificationSettings",
        JSON.stringify(this.userSettings)
      );
    } catch (error) {
      console.error("푸시 알림 설정 저장 실패:", error);
    }
  }

  // 토큰 로드
  private loadToken(): void {
    try {
      const stored = localStorage.getItem("pushNotificationToken");
      if (stored) {
        this.status.token = stored;
        this.status.isRegistered = true;
      }
    } catch (error) {
      console.error("푸시 알림 토큰 로드 실패:", error);
    }
  }

  // 토큰 저장
  private saveToken(token: string): void {
    try {
      localStorage.setItem("pushNotificationToken", token);
      this.status.token = token;
    } catch (error) {
      console.error("푸시 알림 토큰 저장 실패:", error);
    }
  }

  // 사용자가 설정에서 활성화했는지 확인
  isUserEnabled(): boolean {
    return this.userSettings.isUserEnabled;
  }

  // 사용자가 권한을 요청했는지 확인
  hasUserRequestedPermission(): boolean {
    return this.userSettings.hasRequestedPermission;
  }

  // 권한 확인
  async checkPermissions(): Promise<boolean> {
    try {
      return await checkNotificationPermissions();
    } catch (error) {
      console.error("푸시 알림 권한 확인 실패:", error);
      return false;
    }
  }

  // 권한 요청
  async requestPermissions(): Promise<boolean> {
    try {
      const granted = await requestNotificationPermissions();

      // 권한 요청 시도 기록
      this.userSettings.hasRequestedPermission = true;
      this.saveUserSettings();

      return granted;
    } catch (error) {
      console.error("푸시 알림 권한 요청 실패:", error);
      return false;
    }
  }

  // 리스너 추가
  async addListeners(): Promise<void> {
    if (this.listenersAdded) {
      return;
    }

    try {
      // Registration 이벤트 리스너
      await PushNotifications.addListener("registration", async (token) => {
        console.info("Registration token: ", token.value);
        this.status.token = token.value;
        this.status.isRegistered = true;
        this.status.lastRegisterTime = new Date();
        this.status.error = null;
        this.saveToken(token.value);

        // 백엔드로 토큰 전송
        await this.sendTokenToBackend(token.value);
      });

      // Registration Error 이벤트 리스너
      await PushNotifications.addListener("registrationError", (err) => {
        console.error("Registration error: ", err.error);
        this.status.error = `등록 실패: ${err.error}`;
        this.status.isRegistered = false;
      });

      // Push Notification Received 이벤트 리스너
      await PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          console.log("Push notification received: ", notification);
          // 여기에 알림 수신 시 처리 로직 추가 가능
        }
      );

      // Push Notification Action Performed 이벤트 리스너
      await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          console.log(
            "Push notification action performed",
            notification.actionId,
            notification.inputValue
          );
          // 여기에 알림 액션 처리 로직 추가 가능
        }
      );

      this.listenersAdded = true;
    } catch (error) {
      console.error("푸시 알림 리스너 추가 실패:", error);
      this.status.error = `리스너 추가 실패: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  // 푸시 알림 등록
  async register(): Promise<boolean> {
    try {
      // 사용자 설정 확인
      if (!this.isUserEnabled()) {
        return false;
      }

      // 권한 확인
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          this.status.error = "푸시 알림 권한이 필요합니다.";
          return false;
        }
      }

      // Android의 경우 알림 채널 생성
      if ((await this.detectPlatform()) === "android") {
        await this.createNotificationChannel();
      }

      // 리스너 추가
      await this.addListeners();

      // 푸시 알림 등록
      await PushNotifications.register();

      this.status.error = null;
      return true;
    } catch (error) {
      console.error("푸시 알림 등록 실패:", error);
      this.status.error = `등록 실패: ${
        error instanceof Error ? error.message : String(error)
      }`;
      return false;
    }
  }

  // 전달된 알림 목록 가져오기
  async getDeliveredNotifications(): Promise<unknown[]> {
    try {
      const notificationList =
        await PushNotifications.getDeliveredNotifications();
      console.log("delivered notifications", notificationList);
      return notificationList.notifications || [];
    } catch (error) {
      console.error("전달된 알림 목록 조회 실패:", error);
      return [];
    }
  }

  // 상태 가져오기
  getStatus(): PushNotificationStatus {
    return { ...this.status };
  }

  // 사용자 설정에서 알림 활성화/비활성화
  setUserEnabled(enabled: boolean): void {
    this.userSettings.isUserEnabled = enabled;
    this.status.isEnabled = enabled;
    this.saveUserSettings();

    if (!enabled) {
      // 비활성화 시 백엔드에 알림
      if (this.status.token) {
        this.deactivateTokenInBackend(this.status.token).catch((error) => {
          console.error("토큰 비활성화 실패:", error);
        });
      }
      this.status.error = null;
    } else {
      // 활성화 시 기존 토큰이 있으면 백엔드로 전송
      if (this.status.token) {
        this.sendTokenToBackend(this.status.token).catch((error) => {
          console.error("토큰 재전송 실패:", error);
        });
      }
    }
  }

  // 로그인 후 호출: 기존 토큰이 있으면 백엔드로 전송
  async syncTokenIfExists(): Promise<void> {
    if (this.status.token && this.isUserEnabled()) {
      await this.sendTokenToBackend(this.status.token);
    }
  }

  // 에러 초기화
  clearError(): void {
    this.status.error = null;
  }

  // 토큰 가져오기
  getToken(): string | null {
    return this.status.token;
  }

  // 플랫폼 감지
  private async detectPlatform(): Promise<"ios" | "android"> {
    try {
      return Capacitor.getPlatform() === "ios" ? "ios" : "android";
    } catch (error) {
      console.error("플랫폼 감지 실패:", error);
      return "android"; // 기본값
    }
  }

  // Android 알림 채널 생성
  private async createNotificationChannel(): Promise<void> {
    try {
      // strings.xml에 정의된 채널 ID와 이름 사용
      const channel: Channel = {
        id: "fcm_default_channel", // AndroidManifest.xml의 default_notification_channel_id
        name: "일반 알림", // strings.xml의 default_notification_channel_name
        description: "Team Elliot 앱의 일반 알림 채널",
        importance: 5, // 최대 중요도 (헤드업 알림 표시)
        visibility: 1, // 잠금 화면에 표시
        sound: "default", // 기본 알림음
        vibration: true, // 진동 활성화
        lights: true, // LED 활성화
        lightColor: "#AC9592", // 앱 테마 색상
      };

      await PushNotifications.createChannel(channel);
      console.log("✅ Android 알림 채널 생성 완료:", channel.id);
    } catch (error) {
      console.error("❌ Android 알림 채널 생성 실패:", error);
      // 채널 생성 실패해도 푸시 알림은 동작할 수 있음 (기본 채널 사용)
    }
  }

  // 토큰을 백엔드로 전송
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // 현재 사용자 세션 확인
      const session = SessionManager.get();
      if (!session || !session.accessToken) {
        console.warn("로그인하지 않은 사용자, 토큰 전송 건너뜀");
        return;
      }

      // 플랫폼 감지
      const platform = await this.detectPlatform();

      // API 호출
      await registerDevice({
        token,
        platform,
      });

      console.log("✅ 디바이스 토큰이 백엔드에 저장되었습니다");
    } catch (error) {
      console.error("❌ 디바이스 토큰 전송 실패:", error);
      // 실패해도 앱 동작에는 영향 없음 (재시도 로직 고려 가능)
    }
  }

  // 토큰을 백엔드에서 비활성화 (토글 OFF)
  private async deactivateTokenInBackend(token: string): Promise<void> {
    try {
      const session = SessionManager.get();
      if (!session || !session.accessToken) {
        console.warn("로그인하지 않은 사용자, 토큰 비활성화 건너뜀");
        return;
      }

      await deactivateDevice({ token });
      console.log("✅ 디바이스 토큰이 비활성화되었습니다");
    } catch (error) {
      console.error("❌ 디바이스 토큰 비활성화 실패:", error);
    }
  }

  // 토큰을 백엔드에서 완전 삭제 (로그아웃)
  async deleteTokenFromBackend(token: string): Promise<void> {
    try {
      const session = SessionManager.get();
      if (!session || !session.accessToken) {
        console.warn("로그인하지 않은 사용자, 토큰 삭제 건너뜀");
        return;
      }

      await unregisterDevice({ token });
      console.log("✅ 디바이스 토큰이 완전히 삭제되었습니다");
    } catch (error) {
      console.error("❌ 디바이스 토큰 삭제 실패:", error);
    }
  }
}

// 싱글톤 인스턴스 생성
export const pushNotificationService = new PushNotificationService();
