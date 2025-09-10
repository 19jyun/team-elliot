// 포매팅 관련 유틸리티 함수들

/**
 * 숫자를 통화 형식으로 포매팅합니다.
 * @param amount - 포매팅할 금액
 * @returns 포매팅된 통화 문자열 (예: "1,000원")
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

/**
 * 요일을 짧은 한글로 변환합니다.
 * @param dayOfWeek - 요일 문자열
 * @returns 짧은 한글 요일 (예: "월")
 */
export function getDayOfWeekText(dayOfWeek: string): string {
  const dayMap: Record<string, string> = {
    MONDAY: "월",
    TUESDAY: "화",
    WEDNESDAY: "수",
    THURSDAY: "목",
    FRIDAY: "금",
    SATURDAY: "토",
    SUNDAY: "일",
  };
  return dayMap[dayOfWeek] || dayOfWeek;
}

/**
 * 레벨을 한글 텍스트로 변환합니다.
 * @param level - 레벨 문자열
 * @returns 한글 레벨 텍스트 (예: "초급")
 */
export function getLevelText(level: string): string {
  const levelMap: Record<string, string> = {
    BEGINNER: "초급",
    INTERMEDIATE: "중급",
    ADVANCED: "고급",
  };
  return levelMap[level] || level;
}

/**
 * 레벨에 따른 색상을 반환합니다.
 * @param level - 레벨 문자열
 * @returns 색상 코드
 */
export function getLevelColor(level: string): string {
  const colorMap: Record<string, string> = {
    BEGINNER: "#F4E7E7",
    INTERMEDIATE: "#FBF4D8",
    ADVANCED: "#CBDFE3",
  };
  return colorMap[level] || "#F8F5E9";
}

/**
 * 상태를 한글 텍스트로 변환합니다.
 * @param status - 상태 문자열
 * @returns 한글 상태 텍스트 (예: "대기")
 */
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "대기",
    CONFIRMED: "확정",
    CANCELLED: "취소",
    ATTENDED: "출석",
    ABSENT: "결석",
    COMPLETED: "완료",
  };
  return statusMap[status] || status;
}

/**
 * 상태에 따른 CSS 클래스를 반환합니다.
 * @param status - 상태 문자열
 * @returns CSS 클래스 문자열 (예: "text-yellow-600 bg-yellow-100")
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: "text-yellow-600 bg-yellow-100",
    CONFIRMED: "text-green-600 bg-green-100",
    CANCELLED: "text-red-600 bg-red-100",
    ATTENDED: "text-blue-600 bg-blue-100",
    ABSENT: "text-gray-600 bg-gray-100",
    COMPLETED: "text-purple-600 bg-purple-100",
  };
  return colorMap[status] || "text-gray-600 bg-gray-100";
}
