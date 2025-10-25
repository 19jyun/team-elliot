/**
 * Capacitor Calendar에서 반환되는 캘린더 정보 타입
 * 실제 로그 데이터와 일치하도록 정의
 */
export interface CalendarInfo {
  /** 캘린더 고유 ID */
  id: string;
  /** 캘린더 표시 제목 */
  title: string;
  /** 내부 제목 */
  internalTitle: string | null;
  /** 캘린더 색상 (HEX) */
  color: string;
  /** 계정 이름 (이메일) */
  accountName: string | null;
  /** 소유자 계정 */
  ownerAccount: string | null;
  /** 최대 리마인더 수 */
  maxReminders: number | null;
  /** 캘린더 표시 여부 */
  visible: boolean | null;
  /** 기본 캘린더 여부 (추가 필드) */
  isPrimary?: boolean;
}

/**
 * 캘린더 선택 모달에서 사용하는 확장된 캘린더 정보
 */
export interface CalendarSelectionInfo extends CalendarInfo {
  /** 선택된 상태 */
  isSelected: boolean;
  /** 추천 캘린더 여부 (이메일 계정인 경우) */
  isRecommended: boolean;
}

/**
 * 캘린더 권한 정보
 */
export interface CalendarPermissions {
  readCalendar: "granted" | "denied" | "prompt" | "prompt-with-rationale";
  writeCalendar: "granted" | "denied" | "prompt" | "prompt-with-rationale";
  readReminders: "granted" | "denied" | "prompt" | "prompt-with-rationale";
  writeReminders: "granted" | "denied" | "prompt" | "prompt-with-rationale";
}
