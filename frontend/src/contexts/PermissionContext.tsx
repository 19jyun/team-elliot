"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { PermissionManager } from "@/services/PermissionManager";
import {
  PermissionManagerState,
  PermissionRequestResult,
  UserRole,
  PermissionConfig,
} from "@/types/Permission";

interface PermissionContextType {
  // 상태
  state: PermissionManagerState;
  isLoading: boolean;
  error: string | null;

  // 권한 관리 함수들
  initialize: (role: UserRole) => Promise<void>;
  requestPermission: (permissionId: string) => Promise<PermissionRequestResult>;
  requestAllPermissions: (role: UserRole) => Promise<PermissionRequestResult[]>;
  refreshPermissions: (role: UserRole) => Promise<void>;

  // 권한 확인 함수들
  isPermissionGranted: (permissionId: string) => boolean;
  hasAllRequiredPermissions: (role: UserRole) => boolean;

  // 설정 함수들
  getPermissionConfig: (permissionId: string) => PermissionConfig | undefined;
  getPermissionsForRole: (role: UserRole) => PermissionConfig[];

  // 에러 처리
  clearError: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: ReactNode;
  role?: UserRole;
}

export function PermissionProvider({
  children,
  role,
}: PermissionProviderProps) {
  const [permissionManager] = useState(() => PermissionManager.getInstance());
  const [state, setState] = useState<PermissionManagerState>(
    permissionManager.getState()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PermissionManager 상태 변경 감지
  useEffect(() => {
    const unsubscribe = permissionManager.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [permissionManager]);

  // 역할이 변경되면 자동으로 초기화
  useEffect(() => {
    if (role) {
      initialize(role);
    }
  }, [role]);

  // 권한 초기화
  const initialize = async (userRole: UserRole): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await permissionManager.initialize(userRole);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "권한 초기화 실패";
      setError(errorMessage);
      console.error("PermissionProvider 초기화 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 개별 권한 요청
  const requestPermission = async (
    permissionId: string
  ): Promise<PermissionRequestResult> => {
    try {
      setError(null);
      return await permissionManager.requestPermission(permissionId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "권한 요청 실패";
      setError(errorMessage);
      console.error("권한 요청 실패:", err);

      return {
        permissionId,
        status: {
          granted: false,
          canAskAgain: false,
          platform: "web",
          lastChecked: new Date(),
          error: errorMessage,
        },
        success: false,
        error: errorMessage,
      };
    }
  };

  // 모든 권한 일괄 요청
  const requestAllPermissions = async (
    userRole: UserRole
  ): Promise<PermissionRequestResult[]> => {
    try {
      setIsLoading(true);
      setError(null);
      return await permissionManager.requestAllPermissions(userRole);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "권한 일괄 요청 실패";
      setError(errorMessage);
      console.error("권한 일괄 요청 실패:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 권한 상태 새로고침
  const refreshPermissions = async (userRole: UserRole): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await permissionManager.refreshPermissions(userRole);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "권한 새로고침 실패";
      setError(errorMessage);
      console.error("권한 새로고침 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 권한 허용 여부 확인
  const isPermissionGranted = (permissionId: string): boolean => {
    return permissionManager.isPermissionGranted(permissionId);
  };

  // 모든 필수 권한 허용 여부 확인
  const hasAllRequiredPermissions = (userRole: UserRole): boolean => {
    return permissionManager.hasAllRequiredPermissions(userRole);
  };

  // 권한 설정 가져오기
  const getPermissionConfig = (
    permissionId: string
  ): PermissionConfig | undefined => {
    return permissionManager.getPermissionConfig(permissionId);
  };

  // 역할별 권한 설정 가져오기
  const getPermissionsForRole = (userRole: UserRole): PermissionConfig[] => {
    return permissionManager.getPermissionsForRole(userRole);
  };

  // 에러 클리어
  const clearError = (): void => {
    setError(null);
  };

  const contextValue: PermissionContextType = {
    state,
    isLoading,
    error,
    initialize,
    requestPermission,
    requestAllPermissions,
    refreshPermissions,
    isPermissionGranted,
    hasAllRequiredPermissions,
    getPermissionConfig,
    getPermissionsForRole,
    clearError,
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
}

// PermissionContext 사용을 위한 훅
export function usePermissionContext(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error(
      "usePermissionContext는 PermissionProvider 내에서 사용되어야 합니다"
    );
  }
  return context;
}

// 권한 관련 편의 훅들
export function usePermissionState() {
  const { state, isLoading, error } = usePermissionContext();
  return { state, isLoading, error };
}

export function usePermissionActions() {
  const {
    initialize,
    requestPermission,
    requestAllPermissions,
    refreshPermissions,
    clearError,
  } = usePermissionContext();
  return {
    initialize,
    requestPermission,
    requestAllPermissions,
    refreshPermissions,
    clearError,
  };
}

export function usePermissionQueries() {
  const {
    isPermissionGranted,
    hasAllRequiredPermissions,
    getPermissionConfig,
    getPermissionsForRole,
  } = usePermissionContext();
  return {
    isPermissionGranted,
    hasAllRequiredPermissions,
    getPermissionConfig,
    getPermissionsForRole,
  };
}
