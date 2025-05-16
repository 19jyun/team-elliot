import { useSession } from 'next-auth/react';
import { ROLE_PERMISSIONS, PERMISSION_DESCRIPTIONS, Permission, UserRole } from '@/types/auth';

export const useAuthorization = () => {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  const hasPermission = (permission: Permission): boolean => {
    if (status === 'loading') return false;
    if (!session || !userRole) return false;
    return ROLE_PERMISSIONS[userRole].includes(permission);
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
    return ROLE_PERMISSIONS[userRole];
  };

  const isRole = (role: UserRole): boolean => userRole === role;
  const isAdmin = (): boolean => isRole('admin');
  const isTeacher = (): boolean => isRole('teacher');
  const isStudent = (): boolean => isRole('student');

  const getAuthorizationError = (permission: Permission): string | null => {
    if (status === 'loading') return '권한을 확인하는 중입니다...';
    if (!session) return '로그인이 필요합니다.';
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
    isLoading: status === 'loading',
    getAuthorizationError,
  };
};
