import { CapacitorCalendarPlugin } from "@ebarooni/capacitor-calendar";
import { registerPlugin } from "@capacitor/core";
import { PermissionStatus } from "@/types/Permission";

export async function checkCalendarPermission(): Promise<PermissionStatus> {
  try {
    const calendar = registerPlugin<CapacitorCalendarPlugin>(
      "CapacitorCalendarPlugin"
    );
    const result = await calendar.checkAllPermissions();
    // 읽기 권한이 허용되어 있으면 granted, 아니면 denied
    return result.result.readCalendar === "granted" ? "granted" : "denied";
  } catch (error) {
    console.error("캘린더 권한 확인 실패:", error);
    return "denied";
  }
}

export async function requestCalendarPermission(): Promise<PermissionStatus> {
  try {
    const calendar = registerPlugin<CapacitorCalendarPlugin>(
      "CapacitorCalendarPlugin"
    );
    const result = await calendar.requestAllPermissions();
    // 읽기 권한이 허용되어 있으면 granted, 아니면 denied
    return result.result.readCalendar === "granted" ? "granted" : "denied";
  } catch (error) {
    console.error("캘린더 권한 요청 실패:", error);
    return "denied";
  }
}

export async function checkCalendarWritePermission(): Promise<PermissionStatus> {
  try {
    const calendar = registerPlugin<CapacitorCalendarPlugin>(
      "CapacitorCalendarPlugin"
    );
    const result = await calendar.checkAllPermissions();
    // 쓰기 권한이 허용되어 있으면 granted, 아니면 denied
    return result.result.writeCalendar === "granted" ? "granted" : "denied";
  } catch (error) {
    console.error("캘린더 쓰기 권한 확인 실패:", error);
    return "denied";
  }
}

export async function requestCalendarWritePermission(): Promise<PermissionStatus> {
  try {
    const calendar = registerPlugin<CapacitorCalendarPlugin>(
      "CapacitorCalendarPlugin"
    );
    const result = await calendar.requestAllPermissions();
    // 쓰기 권한이 허용되어 있으면 granted, 아니면 denied
    return result.result.writeCalendar === "granted" ? "granted" : "denied";
  } catch (error) {
    console.error("캘린더 쓰기 권한 요청 실패:", error);
    return "denied";
  }
}
