import { useEffect, useRef } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { App } from "@capacitor/app";
import { toast } from "sonner";
import {
  calendarSyncService,
  type UnifiedCalendarSession,
} from "@/services/calendarSyncService";

interface UseCalendarAutoSyncProps {
  sessions?: UnifiedCalendarSession[];
  isEnabled: boolean;
  queryKey: QueryKey;
}

export function useCalendarAutoSync({
  sessions,
  isEnabled,
  queryKey,
}: UseCalendarAutoSyncProps) {
  const queryClient = useQueryClient();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const handleAppStateChange = async ({
      isActive,
    }: {
      isActive: boolean;
    }) => {
      if (isActive && isEnabled) {
        await queryClient.invalidateQueries({ queryKey });
      }
    };

    const listenerPromise = App.addListener(
      "appStateChange",
      handleAppStateChange
    );
    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [queryClient, queryKey, isEnabled]);

  useEffect(() => {
    const sync = async () => {
      if (!isEnabled || !sessions?.length || isSyncingRef.current) {
        return;
      }

      try {
        isSyncingRef.current = true;
        const success = await calendarSyncService.syncSessionsToDevice(
          sessions
        );

        if (!success) {
          console.warn("캘린더 동기화에 실패했습니다.");
        }
      } catch (error) {
        console.error("캘린더 자동 동기화 중 오류:", error);
        toast.error("캘린더 동기화 실패", {
          description: "일부 일정이 기기 캘린더에 저장되지 않았습니다.",
        });
      } finally {
        isSyncingRef.current = false;
      }
    };

    sync();
  }, [sessions, isEnabled]);
}
