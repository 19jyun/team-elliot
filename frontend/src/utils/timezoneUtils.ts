/**
 * 시간대 변환 유틸리티
 * 한국 시간대(Asia/Seoul)를 기준으로 한 날짜/시간 변환 기능 제공
 */

export interface TimezoneConversionResult {
  /** UTC 기준 ISO 문자열 */
  utcIsoString: string;
  /** 한국 시간 기준 로컬 문자열 */
  koreanLocalString: string;
  /** 밀리초 타임스탬프 */
  timestamp: number;
  /** 한국 시간대 오프셋 (분) */
  koreanOffsetMinutes: number;
}

export interface SessionDateTime {
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * 세션 데이터의 날짜/시간을 적절한 Date 객체로 변환
 * @param session 세션 데이터
 * @returns 시작/종료 Date 객체
 */
export function parseSessionDateTime(session: SessionDateTime): {
  startDate: Date;
  endDate: Date;
} {
  let startDate: Date;
  let endDate: Date;

  // 이미 완전한 ISO 문자열인지 확인
  if (
    session.date?.includes("T") &&
    session.startTime?.includes("T") &&
    session.endTime?.includes("T")
  ) {
    console.log("📅 완전한 ISO 문자열 감지 - 한국 시간대로 변환");
    // ISO 문자열을 한국 시간대로 해석하여 Date 객체 생성
    const startTimeStr = session.startTime;
    const endTimeStr = session.endTime;

    // 한국 시간대(UTC+9)를 고려한 변환
    startDate = new Date(startTimeStr);
    endDate = new Date(endTimeStr);

    // 한국 시간대 오프셋 적용 (UTC+9 = +9시간)
    const koreanOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로
    startDate = new Date(startDate.getTime() - koreanOffset);
    endDate = new Date(endDate.getTime() - koreanOffset);
  } else {
    // 기존 방식: 날짜와 시간 조합 (한국 시간대 가정)
    const dateTimeStart = `${session.date}T${session.startTime}`;
    const dateTimeEnd = `${session.date}T${session.endTime}`;

    console.log("📅 날짜 문자열 조합 (한국 시간대):", {
      dateTimeStart,
      dateTimeEnd,
      dateTimeStartLength: dateTimeStart.length,
      dateTimeEndLength: dateTimeEnd.length,
    });

    // 한국 시간대로 해석하여 Date 객체 생성
    startDate = new Date(dateTimeStart);
    endDate = new Date(dateTimeEnd);

    // 한국 시간대 오프셋 적용
    const koreanOffset = 9 * 60 * 60 * 1000;
    startDate = new Date(startDate.getTime() - koreanOffset);
    endDate = new Date(endDate.getTime() - koreanOffset);
  }

  // Invalid Date 체크
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error("❌ Invalid Date 발생 - 세션 데이터 형식 문제");
    throw new Error(
      `Invalid Date: date="${session.date}", startTime="${session.startTime}", endTime="${session.endTime}"`
    );
  }

  return { startDate, endDate };
}

/**
 * Date 객체를 한국 시간대로 변환하여 상세 정보 반환
 * @param date 변환할 Date 객체
 * @returns 시간대 변환 결과
 */
export function convertToKoreanTimezone(date: Date): TimezoneConversionResult {
  const utcIsoString = date.toISOString();
  const koreanLocalString = date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
  const timestamp = date.getTime();

  // 한국 시간대 오프셋 계산 (UTC+9 = +540분)
  const koreanOffsetMinutes = 540;

  return {
    utcIsoString,
    koreanLocalString,
    timestamp,
    koreanOffsetMinutes,
  };
}

/**
 * 세션의 시작/종료 시간을 한국 시간대로 변환하여 로그 출력
 * @param startDate 시작 시간
 * @param endDate 종료 시간
 */
export function logKoreanTimezoneConversion(
  startDate: Date,
  endDate: Date
): void {
  const startConversion = convertToKoreanTimezone(startDate);
  const endConversion = convertToKoreanTimezone(endDate);

  console.log("📅 변환된 날짜:", {
    startDate: startConversion.utcIsoString,
    endDate: endConversion.utcIsoString,
    startTimestamp: startConversion.timestamp,
    endTimestamp: endConversion.timestamp,
    koreanStartTime: startConversion.koreanLocalString,
    koreanEndTime: endConversion.koreanLocalString,
    durationMinutes:
      (endConversion.timestamp - startConversion.timestamp) / (1000 * 60),
  });
}

/**
 * 한국 시간대를 고려한 Date 객체 생성
 * @param year 년도
 * @param month 월 (1-12)
 * @param day 일
 * @param hour 시간 (0-23)
 * @param minute 분 (0-59)
 * @param second 초 (0-59, 기본값: 0)
 * @returns 한국 시간대를 고려한 Date 객체
 */
export function createKoreanDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number = 0
): Date {
  // 한국 시간대로 Date 객체 생성
  const koreanDate = new Date(year, month - 1, day, hour, minute, second);

  // UTC 오프셋 조정 (한국은 UTC+9)
  const utcDate = new Date(koreanDate.getTime() - 9 * 60 * 60 * 1000);

  return utcDate;
}

/**
 * 두 시간 사이의 차이를 분 단위로 계산
 * @param startDate 시작 시간
 * @param endDate 종료 시간
 * @returns 차이 (분)
 */
export function getDurationMinutes(startDate: Date, endDate: Date): number {
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60);
}

/**
 * 현재 한국 시간 반환
 * @returns 현재 한국 시간 Date 객체
 */
export function getCurrentKoreanTime(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}
