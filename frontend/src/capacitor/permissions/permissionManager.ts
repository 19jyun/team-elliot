import { PermissionType, PermissionStatus } from "@/types/Permission";
import {
  checkCalendarPermission,
  requestCalendarPermission,
  checkCalendarWritePermission,
  requestCalendarWritePermission,
} from "./calendar";
import {
  checkNotificationPermission,
  requestNotificationPermission,
} from "./notifications";

export async function checkPermission(
  type: PermissionType
): Promise<PermissionStatus> {
  switch (type) {
    case PermissionType.Calendar:
    case PermissionType.CalendarRead:
      return checkCalendarPermission();
    case PermissionType.CalendarWrite:
      return checkCalendarWritePermission();
    case PermissionType.Notifications:
      return checkNotificationPermission();
    default:
      return "denied";
  }
}

export async function requestPermission(
  type: PermissionType
): Promise<PermissionStatus> {
  switch (type) {
    case PermissionType.Calendar:
    case PermissionType.CalendarRead:
      return requestCalendarPermission();
    case PermissionType.CalendarWrite:
      return requestCalendarWritePermission();
    case PermissionType.Notifications:
      return requestNotificationPermission();
    default:
      return "denied";
  }
}
