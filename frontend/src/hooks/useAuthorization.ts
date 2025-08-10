import { useSession } from "next-auth/react";
import {
  ROLE_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  Permission,
  UserRole,
} from "@/types/auth";

export const useAuthorization = () => {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  const hasPermission = (permission: Permission): boolean => {
    if (status === "loading") return false;
    if (!session || !userRole) return false;
    const key = (
      userRole as string
    ).toLowerCase() as keyof typeof ROLE_PERMISSIONS;
    const permissions = ROLE_PERMISSIONS[key] ?? [];
    return (permissions as readonly Permission[]).includes(permission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(hasPermission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(hasPermission);
  };

  const getPermissionDescription = (permission: Permission): string => {
    return PERMISSION_DESCRIPTIONS[permission];
  };

  const getUserPermissions = (): Permission[] => {
    if (!userRole) return [];
    const key = (
      userRole as string
    ).toLowerCase() as keyof typeof ROLE_PERMISSIONS;
    return [...(ROLE_PERMISSIONS[key] ?? [])] as Permission[];
  };

  const isRole = (role: UserRole): boolean =>
    (userRole as string)?.toLowerCase() === role;
  const isAdmin = (): boolean => false; // ADMIN 제거됨
  const isTeacher = (): boolean => isRole("TEACHER");
  const isStudent = (): boolean => isRole("STUDENT");

  const getAuthorizationError = (permission: Permission): string | null => {
    if (status === "loading") return "권한을 확인하는 중입니다...";
    if (!session) return "로그인이 필요합니다.";
    if (!hasPermission(permission)) {
      return `${PERMISSION_DESCRIPTIONS[permission]} 권한이 없습니다.`;
    }
    return null;
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getPermissionDescription,
    getUserPermissions,
    isAdmin,
    isTeacher,
    isStudent,
    userRole,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    getAuthorizationError,
  };
};
