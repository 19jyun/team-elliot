import { CapacitorCalendar } from "@ebarooni/capacitor-calendar";

export const listEventsInRange = async (from: number, to: number) => {
  const { result } = await CapacitorCalendar.listEventsInRange({ from, to });
  return result;
};

// 캘린더 이벤트 생성
export const createEvent = async (event: {
  title: string;
  calendarId?: string;
  location?: string;
  startDate: number;
  endDate: number;
  isAllDay?: boolean;
  description?: string;
}) => {
  return await CapacitorCalendar.createEvent(event);
};

// 이벤트 수정
export const modifyEvent = async (event: {
  id: string;
  title?: string;
  calendarId?: string;
  location?: string;
  startDate?: number;
  endDate?: number;
  isAllDay?: boolean;
  description?: string;
}) => {
  return await CapacitorCalendar.modifyEvent(event);
};

// 이벤트 삭제
export const deleteEvent = async (id: string) => {
  return await CapacitorCalendar.deleteEvent({ id });
};

// 캘린더 목록 조회
export const listCalendars = async () => {
  const { result } = await CapacitorCalendar.listCalendars();
  return result;
};

// 기본 캘린더 조회
export const getDefaultCalendar = async () => {
  const { result } = await CapacitorCalendar.getDefaultCalendar();
  return result;
};

// 권한 확인
export const checkAllPermissions = async () => {
  const { result } = await CapacitorCalendar.checkAllPermissions();
  return result;
};

// 권한 요청
export const requestAllPermissions = async () => {
  const { result } = await CapacitorCalendar.requestAllPermissions();
  return result;
};
