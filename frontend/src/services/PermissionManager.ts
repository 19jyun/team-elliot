import { Capacitor } from "@capacitor/core";
import {
  PermissionConfig,
  PermissionStatus,
  PermissionRequestResult,
  PermissionManagerState,
  UserRole,
  Platform,
} from "@/types/Permission";
import {
  PERMISSION_CONFIGS,
  ROLE_REQUIRED_PERMISSIONS,
  PERMISSION_REQUEST_ORDER,
  getPermissionsForRole,
  getPermissionDependencies,
  isPermissionRequired,
} from "@/config/PermissionConfig";

export class PermissionManager {
  private static instance: PermissionManager;
  private state: PermissionManagerState;
  private listeners: Set<(state: PermissionManagerState) => void> = new Set();

  private constructor() {
    this.state = {
      permissions: new Map(),
      isInitialized: false,
      isRequesting: false,
      lastRequestTime: null,
      hasRequiredPermissions: false,
      missingRequiredPermissions: [],
    };
  }

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  // 상태 변경 리스너 등록
  subscribe(listener: (state: PermissionManagerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 상태 변경 알림
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // 현재 상태 반환
  getState(): PermissionManagerState {
    return { ...this.state };
  }

  // 플랫폼 감지
  private getCurrentPlatform(): Platform {
    if (Capacitor.isNativePlatform()) {
      return Capacitor.getPlatform() as Platform;
    }
    return "web";
  }

  // 권한 초기화
  async initialize(role: UserRole): Promise<void> {
    try {
      this.state.isInitialized = false;
      this.notifyListeners();

      const currentPlatform = this.getCurrentPlatform();
      const rolePermissions = getPermissionsForRole(role);
      const platformPermissions = rolePermissions.filter((p) =>
        p.platform.includes(currentPlatform)
      );

      // 각 권한의 현재 상태 확인
      for (const permission of platformPermissions) {
        const status = await this.checkPermissionStatus(permission.id);
        this.state.permissions.set(permission.id, status);
      }

      // 필수 권한 확인
      this.updateRequiredPermissionsStatus(role);

      this.state.isInitialized = true;
      this.notifyListeners();
    } catch (error) {
      console.error("PermissionManager 초기화 실패:", error);
      throw error;
    }
  }

  // 개별 권한 상태 확인
  async checkPermissionStatus(permissionId: string): Promise<PermissionStatus> {
    try {
      const currentPlatform = this.getCurrentPlatform();

      // 웹 환경에서는 기본값 반환
      if (currentPlatform === "web") {
        return {
          granted: true,
          canAskAgain: true,
          platform: currentPlatform,
          lastChecked: new Date(),
        };
      }

      // 네이티브 플랫폼에서 실제 권한 확인
      const status = await this.checkNativePermission(permissionId);

      return {
        granted: status.granted,
        canAskAgain: status.canAskAgain,
        platform: currentPlatform,
        lastChecked: new Date(),
        error: status.error,
      };
    } catch (error) {
      console.error(`권한 상태 확인 실패 (${permissionId}):`, error);
      return {
        granted: false,
        canAskAgain: false,
        platform: this.getCurrentPlatform(),
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // 네이티브 권한 확인 (실제 플러그인 호출)
  private async checkNativePermission(permissionId: string): Promise<{
    granted: boolean;
    canAskAgain: boolean;
    error?: string;
  }> {
    // 실제 Capacitor 플러그인 호출 로직
    // 현재는 모의 구현

    switch (permissionId) {
      case "calendar.read":
      case "calendar.write":
        // return await Calendar.checkPermissions();
        return { granted: false, canAskAgain: true };

      case "notification.push":
        // return await LocalNotifications.checkPermissions();
        return { granted: false, canAskAgain: true };

      default:
        return {
          granted: false,
          canAskAgain: false,
          error: "Unknown permission",
        };
    }
  }

  // 개별 권한 요청
  async requestPermission(
    permissionId: string
  ): Promise<PermissionRequestResult> {
    try {
      this.state.isRequesting = true;
      this.notifyListeners();

      // 의존성 확인
      const dependencies = getPermissionDependencies(permissionId);
      for (const depId of dependencies) {
        const depStatus = this.state.permissions.get(depId);
        if (!depStatus?.granted) {
          const depResult = await this.requestPermission(depId);
          if (!depResult.success) {
            return {
              permissionId,
              status: {
                granted: false,
                canAskAgain: false,
                platform: this.getCurrentPlatform(),
                lastChecked: new Date(),
                error: `Dependency ${depId} not granted`,
              },
              success: false,
              error: `Dependency ${depId} not granted`,
            };
          }
        }
      }

      // 실제 권한 요청
      const status = await this.requestNativePermission(permissionId);

      // 상태 업데이트
      this.state.permissions.set(permissionId, status);
      this.state.lastRequestTime = new Date();

      const result: PermissionRequestResult = {
        permissionId,
        status,
        success: status.granted,
        error: status.error,
      };

      this.state.isRequesting = false;
      this.notifyListeners();

      return result;
    } catch (error) {
      this.state.isRequesting = false;
      this.notifyListeners();

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        permissionId,
        status: {
          granted: false,
          canAskAgain: false,
          platform: this.getCurrentPlatform(),
          lastChecked: new Date(),
          error: errorMessage,
        },
        success: false,
        error: errorMessage,
      };
    }
  }

  // 네이티브 권한 요청 (실제 플러그인 호출)
  private async requestNativePermission(
    permissionId: string
  ): Promise<PermissionStatus> {
    // 실제 Capacitor 플러그인 호출 로직
    // 현재는 모의 구현

    switch (permissionId) {
      case "calendar.read":
      case "calendar.write":
        // const calendarResult = await Calendar.requestPermissions();
        // return {
        //   granted: calendarResult.granted,
        //   canAskAgain: calendarResult.canAskAgain,
        //   platform: this.getCurrentPlatform(),
        //   lastChecked: new Date()
        // };
        return {
          granted: true, // 모의 성공
          canAskAgain: true,
          platform: this.getCurrentPlatform(),
          lastChecked: new Date(),
        };

      case "notification.push":
        // const notificationResult = await LocalNotifications.requestPermissions();
        return {
          granted: true, // 모의 성공
          canAskAgain: true,
          platform: this.getCurrentPlatform(),
          lastChecked: new Date(),
        };

      default:
        return {
          granted: false,
          canAskAgain: false,
          platform: this.getCurrentPlatform(),
          lastChecked: new Date(),
          error: "Permission not implemented",
        };
    }
  }

  // 모든 권한 일괄 요청
  async requestAllPermissions(
    role: UserRole
  ): Promise<PermissionRequestResult[]> {
    const results: PermissionRequestResult[] = [];
    const rolePermissions = getPermissionsForRole(role);
    const currentPlatform = this.getCurrentPlatform();
    const platformPermissions = rolePermissions.filter((p) =>
      p.platform.includes(currentPlatform)
    );

    // 권한 요청 순서에 따라 처리
    for (const permissionId of PERMISSION_REQUEST_ORDER) {
      const permission = platformPermissions.find((p) => p.id === permissionId);
      if (permission) {
        const result = await this.requestPermission(permissionId);
        results.push(result);

        // 필수 권한이 거부된 경우 중단
        if (permission.required && !result.success) {
          break;
        }
      }
    }

    // 필수 권한 상태 업데이트
    this.updateRequiredPermissionsStatus(role);

    return results;
  }

  // 필수 권한 상태 업데이트
  private updateRequiredPermissionsStatus(role: UserRole): void {
    const requiredPermissions = ROLE_REQUIRED_PERMISSIONS[role];
    const missingPermissions: string[] = [];

    for (const permissionId of requiredPermissions) {
      const status = this.state.permissions.get(permissionId);
      if (!status?.granted) {
        missingPermissions.push(permissionId);
      }
    }

    this.state.hasRequiredPermissions = missingPermissions.length === 0;
    this.state.missingRequiredPermissions = missingPermissions;
  }

  // 권한 상태 새로고침
  async refreshPermissions(role: UserRole): Promise<void> {
    await this.initialize(role);
  }

  // 특정 권한이 허용되었는지 확인
  isPermissionGranted(permissionId: string): boolean {
    const status = this.state.permissions.get(permissionId);
    return status?.granted || false;
  }

  // 모든 필수 권한이 허용되었는지 확인
  hasAllRequiredPermissions(role: UserRole): boolean {
    const requiredPermissions = ROLE_REQUIRED_PERMISSIONS[role];
    return requiredPermissions.every((permissionId) =>
      this.isPermissionGranted(permissionId)
    );
  }

  // 권한 설정 가져오기
  getPermissionConfig(permissionId: string): PermissionConfig | undefined {
    return PERMISSION_CONFIGS.find((p) => p.id === permissionId);
  }

  // 역할별 권한 설정 가져오기
  getPermissionsForRole(role: UserRole): PermissionConfig[] {
    return getPermissionsForRole(role);
  }
}
