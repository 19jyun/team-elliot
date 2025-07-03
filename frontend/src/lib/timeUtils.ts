/**
 * 프론트엔드에서 백엔드로 전송할 시간 포맷팅 유틸리티
 */

/**
 * 한국 시간(GMT+9)을 UTC ISO 문자열로 변환
 * @param dateString YYYY-MM-DD 형식의 날짜 문자열
 * @param timeString HH:mm 형식의 시간 문자열
 * @returns UTC ISO 문자열
 */
export function formatToUTCISO(dateString: string, timeString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);

  // 한국 시간으로 Date 객체 생성
  const koreanTime = new Date(year, month - 1, day, hour, minute, 0, 0);

  // UTC로 변환 (한국 시간 - 9시간)
  const utcTime = new Date(koreanTime.getTime() - 9 * 60 * 60 * 1000);

  return utcTime.toISOString();
}

/**
 * 날짜만 UTC ISO 문자열로 변환 (시간은 00:00:00)
 * @param dateString YYYY-MM-DD 형식의 날짜 문자열
 * @returns UTC ISO 문자열
 */
export function formatDateToUTCISO(dateString: string): string {
  return formatToUTCISO(dateString, "00:00");
}

/**
 * 종료 날짜를 UTC ISO 문자열로 변환 (시간은 23:59:59)
 * @param dateString YYYY-MM-DD 형식의 날짜 문자열
 * @returns UTC ISO 문자열
 */
export function formatEndDateToUTCISO(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);

  // 한국 시간으로 Date 객체 생성 (23:59:59)
  const koreanTime = new Date(year, month - 1, day, 23, 59, 59, 999);

  // UTC로 변환 (한국 시간 - 9시간)
  const utcTime = new Date(koreanTime.getTime() - 9 * 60 * 60 * 1000);

  return utcTime.toISOString();
}

/**
 * UTC ISO 문자열을 한국 시간으로 변환하여 표시
 * @param utcISOString UTC ISO 문자열
 * @returns 한국 시간 Date 객체
 */
export function parseFromUTCISO(utcISOString: string): Date {
  const utcDate = new Date(utcISOString);
  // UTC를 한국 시간으로 변환 (UTC + 9시간)
  return new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
}

/**
 * UTC ISO 문자열을 한국 시간 문자열로 변환
 * @param utcISOString UTC ISO 문자열
 * @returns YYYY-MM-DD HH:mm 형식의 한국 시간 문자열
 */
export function formatUTCISOToKoreanTime(utcISOString: string): string {
  const koreanTime = parseFromUTCISO(utcISOString);
  const date = koreanTime.toISOString().split("T")[0];
  const time = koreanTime.toTimeString().slice(0, 5);
  return `${date} ${time}`;
}
