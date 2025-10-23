import { useState, useEffect, useCallback } from "react";
import { PermissionType, PermissionStatus } from "@/types/Permission";
import {
  checkPermission,
  requestPermission,
} from "@/capacitor/permissions/permissionManager";

export function usePermission(type: PermissionType) {
  const [status, setStatus] = useState<PermissionStatus>("prompt");

  const refresh = useCallback(async () => {
    const s = await checkPermission(type);
    setStatus(s);
  }, [type]);

  const request = useCallback(async () => {
    const s = await requestPermission(type);
    setStatus(s);
  }, [type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, request, refresh };
}
