export enum PermissionType {
  Calendar = "calendar",
  CalendarRead = "calendar-read",
  CalendarWrite = "calendar-write",
  Notifications = "notifications",
}

export type PermissionStatus = "granted" | "denied" | "prompt";
