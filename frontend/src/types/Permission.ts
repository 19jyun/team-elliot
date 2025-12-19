export enum PermissionType {
  Calendar = "calendar",
  CalendarRead = "calendar-read",
  CalendarWrite = "calendar-write",
  Notifications = "notifications",
  Camera = "camera",
  CameraPhotos = "camera-photos",
}

export type PermissionStatus = "granted" | "denied" | "prompt";
