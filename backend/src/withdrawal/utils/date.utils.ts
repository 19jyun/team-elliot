/**
 * 날짜 유틸리티 함수
 */

/**
 * 지정된 년수 추가
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * 지정된 년수 추가 (3년)
 */
export function addThreeYears(date: Date): Date {
  return addYears(date, 3);
}

/**
 * 지정된 년수 추가 (5년)
 */
export function addFiveYears(date: Date): Date {
  return addYears(date, 5);
}
