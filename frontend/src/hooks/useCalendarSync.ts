import { useState, useCallback, useEffect } from "react";
import {
  calendarSyncService,
  type SyncStatus,
} from "@/services/calendarSyncService";

export function useCalendarSync(_role: "STUDENT" | "PRINCIPAL" | "TEACHER") {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    calendarSyncService.getSyncStatus()
  );

  const updateSyncStatus = useCallback(() => {
    setSyncStatus(calendarSyncService.getSyncStatus());
  }, []);

  useEffect(() => {
    updateSyncStatus();
  }, [updateSyncStatus]);

  const setSyncEnabled = useCallback(
    (enabled: boolean) => {
      calendarSyncService.setSyncEnabled(enabled);
      updateSyncStatus();
    },
    [updateSyncStatus]
  );

  const clearError = useCallback(() => {
    calendarSyncService.clearError();
    updateSyncStatus();
  }, [updateSyncStatus]);

  const checkAndRequestPermissions = useCallback(async () => {
    try {
      const hasPermission = await calendarSyncService.checkPermissions();

      if (hasPermission) {
        setSyncEnabled(true);
        return true;
      }

      const granted = await calendarSyncService.requestPermissions();
      if (granted) {
        setSyncEnabled(true);
        return true;
      }

      setSyncEnabled(false);
      return false;
    } catch (error) {
      console.error("캘린더 권한 확인/요청 실패:", error);
      setSyncEnabled(false);
      return false;
    }
  }, [setSyncEnabled]);

  return {
    syncStatus,
    setSyncEnabled,
    clearError,
    checkAndRequestPermissions,
    updateSyncStatus,
  };
}
