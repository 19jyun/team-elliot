// 권한 카테고리 타입
export type PermissionCategory = "calendar" | "notification";

// 플랫폼 타입
export type Platform = "ios" | "android" | "web";

// 사용자 역할 타입
export type UserRole = "PRINCIPAL" | "TEACHER" | "STUDENT";

// 권한 설정 인터페이스
export interface PermissionConfig {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: PermissionCategory;
  platform: Platform[];
  dependencies?: string[]; // 다른 권한에 의존하는 경우
  icon?: string; // UI에서 사용할 아이콘
  order?: number; // 권한 요청 순서
}

// 권한 상태 인터페이스
export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  platform: string;
  lastChecked: Date;
  error?: string;
}

// 권한 요청 결과 인터페이스
export interface PermissionRequestResult {
  permissionId: string;
  status: PermissionStatus;
  success: boolean;
  error?: string;
}

// 권한 그룹 인터페이스
export interface PermissionGroup {
  category: PermissionCategory;
  permissions: PermissionConfig[];
  required: boolean;
  title: string;
  description: string;
}

// 권한 관리 상태 인터페이스
export interface PermissionManagerState {
  permissions: Map<string, PermissionStatus>;
  isInitialized: boolean;
  isRequesting: boolean;
  lastRequestTime: Date | null;
  hasRequiredPermissions: boolean;
  missingRequiredPermissions: string[];
}
