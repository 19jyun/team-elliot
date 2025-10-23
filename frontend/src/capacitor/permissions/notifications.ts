import { PushNotifications } from "@capacitor/push-notifications";
import { PermissionStatus } from "@/types/Permission";

export async function checkNotificationPermission(): Promise<PermissionStatus> {
  const perm = await PushNotifications.checkPermissions();
  if (perm.receive === "granted") return "granted";
  if (perm.receive === "prompt") return "prompt";
  return "denied";
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  const perm = await PushNotifications.requestPermissions();
  if (perm.receive === "granted") {
    await PushNotifications.register();
    return "granted";
  }
  if (perm.receive === "prompt") return "prompt";
  return "denied";
}
