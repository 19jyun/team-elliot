import { CapacitorCalendarPlugin } from "@ebarooni/capacitor-calendar";
import { registerPlugin } from "@capacitor/core";

// 이벤트 목록 조회 (기간 기반)

const calendar = registerPlugin<CapacitorCalendarPlugin>(
  "CapacitorCalendarPlugin"
);

export const listEventsInRange = async (from: number, to: number) => {
  const { result } = await calendar.listEventsInRange({ from, to });
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
  return await calendar.createEvent(event);
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
  return await calendar.modifyEvent(event);
};

// 이벤트 삭제
export const deleteEvent = async (id: string) => {
  return await calendar.deleteEvent({ id });
};

// 캘린더 목록 조회
export const listCalendars = async () => {
  const { result } = await calendar.listCalendars();
  return result;
};

// 기본 캘린더 조회
export const getDefaultCalendar = async () => {
  const { result } = await calendar.getDefaultCalendar();
  return result;
};

// 권한 확인
export const checkAllPermissions = async () => {
  const { result } = await calendar.checkAllPermissions();
  return result;
};

// 권한 요청
export const requestAllPermissions = async () => {
  const { result } = await calendar.requestAllPermissions();
  return result;
};
