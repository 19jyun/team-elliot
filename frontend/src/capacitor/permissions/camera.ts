import { Camera } from "@capacitor/camera";
import { PermissionStatus } from "@/types/Permission";

/**
 * 카메라 권한 확인
 */
export async function checkCameraPermission(): Promise<PermissionStatus> {
  try {
    const permissions = await Camera.checkPermissions();
    if (permissions.camera === "granted") return "granted";
    if (permissions.camera === "prompt") return "prompt";
    return "denied";
  } catch (error) {
    console.error("카메라 권한 확인 실패:", error);
    return "denied";
  }
}

/**
 * 카메라 권한 요청
 */
export async function requestCameraPermission(): Promise<PermissionStatus> {
  try {
    const permissions = await Camera.requestPermissions({
      permissions: ["camera"],
    });
    if (permissions.camera === "granted") return "granted";
    if (permissions.camera === "prompt") return "prompt";
    return "denied";
  } catch (error) {
    console.error("카메라 권한 요청 실패:", error);
    return "denied";
  }
}

/**
 * 사진 라이브러리 권한 확인
 */
export async function checkPhotosPermission(): Promise<PermissionStatus> {
  try {
    const permissions = await Camera.checkPermissions();
    // iOS: photos, Android: photos
    if (permissions.photos === "granted") return "granted";
    if (permissions.photos === "limited") return "prompt"; // iOS 14+ limited access
    if (permissions.photos === "prompt") return "prompt";
    return "denied";
  } catch (error) {
    console.error("사진 권한 확인 실패:", error);
    return "denied";
  }
}

/**
 * 사진 라이브러리 권한 요청
 */
export async function requestPhotosPermission(): Promise<PermissionStatus> {
  try {
    const permissions = await Camera.requestPermissions({
      permissions: ["photos"],
    });
    if (permissions.photos === "granted") return "granted";
    if (permissions.photos === "limited") return "prompt";
    if (permissions.photos === "prompt") return "prompt";
    return "denied";
  } catch (error) {
    console.error("사진 권한 요청 실패:", error);
    return "denied";
  }
}

/**
 * 모든 Camera 권한 확인 (camera + photos)
 */
export async function checkAllCameraPermissions(): Promise<{
  camera: PermissionStatus;
  photos: PermissionStatus;
}> {
  const [camera, photos] = await Promise.all([
    checkCameraPermission(),
    checkPhotosPermission(),
  ]);
  return { camera, photos };
}
