import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/index";
import {
  calendarSyncService,
  type SyncStatus,
} from "@/services/calendarSyncService";
import type { UnifiedCalendarSession } from "@/services/calendarSyncService";

// 역할별 캘린더 세션 선택자
const selectStudentSessions = (state: RootState) =>
  state.student.data?.calendarSessions || [];
const selectPrincipalSessions = (state: RootState) =>
  state.principal.data?.calendarSessions || [];
const selectTeacherSessions = (state: RootState) =>
  state.teacher.data?.calendarSessions || [];

// 캘린더 동기화 훅
export function useCalendarSync(role: "STUDENT" | "PRINCIPAL" | "TEACHER") {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    calendarSyncService.getSyncStatus()
  );

  // 역할별 세션 선택
  const sessions = useSelector((state: RootState) => {
    switch (role) {
      case "STUDENT":
        return selectStudentSessions(state);
      case "PRINCIPAL":
        return selectPrincipalSessions(state);
      case "TEACHER":
        return selectTeacherSessions(state);
      default:
        return [];
    }
  });

  // 동기화 상태 업데이트
  const updateSyncStatus = useCallback(() => {
    setSyncStatus(calendarSyncService.getSyncStatus());
  }, []);

  // 세션들을 기기 캘린더에 동기화
  const syncSessionsToDevice = useCallback(async () => {
    try {
      const success = await calendarSyncService.syncSessionsToDevice(
        sessions as UnifiedCalendarSession[]
      );
      updateSyncStatus();
      return success;
    } catch (error) {
      console.error("캘린더 동기화 실패:", error);
      updateSyncStatus();
      return false;
    }
  }, [sessions, updateSyncStatus]);

  // 세션 변경 시 자동 동기화
  useEffect(() => {
    if (sessions.length > 0 && syncStatus.isEnabled) {
      console.log(
        `${role} 캘린더 세션 변경 감지, 동기화 시작:`,
        sessions.length,
        "개 세션"
      );
      syncSessionsToDevice();
    }
  }, [sessions, syncStatus.isEnabled, role, syncSessionsToDevice]);

  // 개별 세션 추가
  const addSessionToDevice = useCallback(
    async (session: UnifiedCalendarSession) => {
      try {
        const success = await calendarSyncService.addSessionToDevice(session);
        updateSyncStatus();
        return success;
      } catch (error) {
        console.error("세션 추가 실패:", error);
        updateSyncStatus();
        return false;
      }
    },
    [updateSyncStatus]
  );

  // 개별 세션 제거
  const removeSessionFromDevice = useCallback(
    async (sessionId: string) => {
      try {
        const success = await calendarSyncService.removeSessionFromDevice(
          sessionId
        );
        updateSyncStatus();
        return success;
      } catch (error) {
        console.error("세션 제거 실패:", error);
        updateSyncStatus();
        return false;
      }
    },
    [updateSyncStatus]
  );

  // 개별 세션 업데이트
  const updateSessionInDevice = useCallback(
    async (session: UnifiedCalendarSession) => {
      try {
        const success = await calendarSyncService.updateSessionInDevice(
          session
        );
        updateSyncStatus();
        return success;
      } catch (error) {
        console.error("세션 업데이트 실패:", error);
        updateSyncStatus();
        return false;
      }
    },
    [updateSyncStatus]
  );

  // 동기화 활성화/비활성화
  const setSyncEnabled = useCallback(
    (enabled: boolean) => {
      calendarSyncService.setSyncEnabled(enabled);
      updateSyncStatus();
    },
    [updateSyncStatus]
  );

  // 에러 초기화
  const clearError = useCallback(() => {
    calendarSyncService.clearError();
    updateSyncStatus();
  }, [updateSyncStatus]);

  // 권한 확인 및 요청
  const checkAndRequestPermissions = useCallback(async () => {
    try {
      const hasPermission = await calendarSyncService.checkPermissions();
      if (!hasPermission) {
        const granted = await calendarSyncService.requestPermissions();
        if (granted) {
          setSyncEnabled(true);
          return true;
        }
        return false;
      }
      setSyncEnabled(true);
      return true;
    } catch (error) {
      console.error("권한 확인/요청 실패:", error);
      return false;
    }
  }, [setSyncEnabled]);

  return {
    // 상태
    syncStatus,
    sessions,

    // 액션
    syncSessionsToDevice,
    addSessionToDevice,
    removeSessionFromDevice,
    updateSessionInDevice,
    setSyncEnabled,
    clearError,
    checkAndRequestPermissions,

    // 헬퍼
    updateSyncStatus,
  };
}
