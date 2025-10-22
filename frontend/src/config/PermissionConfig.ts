import {
  PermissionConfig,
  PermissionGroup,
  UserRole,
  Platform,
} from "@/types/Permission";

// 기본 권한 설정들
export const PERMISSION_CONFIGS: PermissionConfig[] = [
  // 캘린더 권한
  {
    id: "calendar.read",
    name: "캘린더 읽기",
    description: "수업 일정을 캘린더에서 확인할 수 있습니다",
    required: true,
    category: "calendar",
    platform: ["ios", "android"],
    icon: "calendar",
    order: 1,
  },
  {
    id: "calendar.write",
    name: "캘린더 쓰기",
    description: "수업 일정을 캘린더에 추가하고 수정할 수 있습니다",
    required: true,
    category: "calendar",
    platform: ["ios", "android"],
    dependencies: ["calendar.read"],
    icon: "calendar-edit",
    order: 2,
  },

  // 알림 권한
  {
    id: "notification.push",
    name: "푸시 알림",
    description: "중요한 알림을 받을 수 있습니다",
    required: false,
    category: "notification",
    platform: ["ios", "android"],
    icon: "bell",
    order: 3,
  },
];

// 역할별 필수 권한 매핑
export const ROLE_REQUIRED_PERMISSIONS: Record<UserRole, string[]> = {
  PRINCIPAL: ["calendar.read", "calendar.write"],
  TEACHER: ["calendar.read", "calendar.write"],
  STUDENT: ["calendar.read"],
};

// 권한 그룹 정의
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: "calendar",
    permissions: PERMISSION_CONFIGS.filter((p) => p.category === "calendar"),
    required: true,
    title: "캘린더 접근",
    description: "수업 일정을 캘린더와 동기화하기 위해 필요합니다",
  },
  {
    category: "notification",
    permissions: PERMISSION_CONFIGS.filter(
      (p) => p.category === "notification"
    ),
    required: false,
    title: "알림",
    description: "수업 관련 알림을 받기 위해 필요합니다",
  },
];

// 권한 요청 순서 정의 (의존성 고려)
export const PERMISSION_REQUEST_ORDER: string[] = [
  "calendar.read",
  "calendar.write",
  "notification.push",
];

// 플랫폼별 권한 필터링 함수
export function getPermissionsForPlatform(
  platform: Platform
): PermissionConfig[] {
  return PERMISSION_CONFIGS.filter((permission) =>
    permission.platform.includes(platform)
  );
}

// 역할별 권한 필터링 함수
export function getPermissionsForRole(role: UserRole): PermissionConfig[] {
  const requiredPermissions = ROLE_REQUIRED_PERMISSIONS[role];
  return PERMISSION_CONFIGS.filter(
    (permission) =>
      requiredPermissions.includes(permission.id) || !permission.required
  );
}

// 권한 의존성 확인 함수
export function getPermissionDependencies(permissionId: string): string[] {
  const permission = PERMISSION_CONFIGS.find((p) => p.id === permissionId);
  return permission?.dependencies || [];
}

// 권한이 필수인지 확인하는 함수
export function isPermissionRequired(
  permissionId: string,
  role: UserRole
): boolean {
  const requiredPermissions = ROLE_REQUIRED_PERMISSIONS[role];
  return requiredPermissions.includes(permissionId);
}
