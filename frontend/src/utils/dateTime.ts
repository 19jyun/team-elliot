// 날짜/시간 관련 유틸리티 함수들

/**
 * 시간을 한국 시간 형식으로 포맷팅합니다.
 * @param time - 시간 문자열 또는 Date 객체
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 시간 문자열 (예: "14:30")
 */
export function formatTime(
  time: string | Date,
  options: {
    hour12?: boolean;
    showSeconds?: boolean;
  } = {}
): string {
  const { hour12 = false, showSeconds = false } = options;
  const date = typeof time === "string" ? new Date(time) : time;

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12,
  });
}

/**
 * 날짜를 한국 날짜 형식으로 포맷팅합니다.
 * @param date - 날짜 문자열 또는 Date 객체
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  date: string | Date,
  options: {
    includeYear?: boolean;
    includeWeekday?: boolean;
    format?: "short" | "long" | "numeric";
  } = {}
): string {
  const {
    includeYear = false,
    includeWeekday = false,
    format = "short",
  } = options;
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: format === "numeric" ? "numeric" : "short",
    day: "numeric",
  };

  if (includeYear) {
    formatOptions.year = "numeric";
  }

  if (includeWeekday) {
    formatOptions.weekday = "short";
  }

  return dateObj.toLocaleDateString("ko-KR", formatOptions);
}

/**
 * 시간 범위를 포맷팅합니다.
 * @param startTime - 시작 시간
 * @param endTime - 종료 시간
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 시간 범위 문자열 (예: "14:30-16:00")
 */
export function formatTimeRange(
  startTime: string | Date,
  endTime: string | Date,
  options: {
    hour12?: boolean;
    showSeconds?: boolean;
  } = {}
): string {
  const start = formatTime(startTime, options);
  const end = formatTime(endTime, options);
  return `${start}-${end}`;
}

/**
 * 날짜와 시간을 함께 포맷팅합니다.
 * @param date - 날짜
 * @param time - 시간
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 날짜+시간 문자열
 */
export function formatDateTime(
  date: string | Date,
  time: string | Date,
  options: {
    includeYear?: boolean;
    includeWeekday?: boolean;
    hour12?: boolean;
  } = {}
): string {
  const formattedDate = formatDate(date, options);
  const formattedTime = formatTime(time, { hour12: options.hour12 });
  return `${formattedDate} ${formattedTime}`;
}

/**
 * MM월 DD일 형식으로 날짜를 포맷팅합니다.
 * @param dateStr - 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (예: "3월 15일")
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 요일을 한글로 변환합니다.
 * @param dayOfWeek - 요일 문자열
 * @returns 한글 요일 (예: "월요일")
 */
export function formatDayOfWeek(dayOfWeek: string): string {
  const dayMap: Record<string, string> = {
    MONDAY: "월요일",
    TUESDAY: "화요일",
    WEDNESDAY: "수요일",
    THURSDAY: "목요일",
    FRIDAY: "금요일",
    SATURDAY: "토요일",
    SUNDAY: "일요일",
  };
  return dayMap[dayOfWeek] || dayOfWeek;
}

/**
 * 현재 시간과 비교하여 과거/미래를 판단합니다.
 * @param date - 비교할 날짜
 * @returns true면 과거, false면 미래
 */
export function isPastDate(date: string | Date): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  return targetDate < new Date();
}

/**
 * 두 날짜가 같은 날인지 확인합니다.
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 * @returns 같은 날이면 true
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
