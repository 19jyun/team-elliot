import { FocusType } from "@/contexts/DashboardContext";

// 포커스 타입별 우선순위 (높을수록 우선순위가 높음)
const FOCUS_PRIORITY: Record<FocusType, number> = {
  overlay: 4,
  modal: 3,
  subpage: 2,
  dashboard: 1,
};

// 포커스 타입별 설명
export const FOCUS_DESCRIPTIONS: Record<FocusType, string> = {
  dashboard: "대시보드 메인 화면",
  modal: "모달 다이얼로그",
  subpage: "서브 페이지",
  overlay: "오버레이 요소",
};

// 포커스 우선순위 비교
export function compareFocusPriority(
  focus1: FocusType,
  focus2: FocusType
): number {
  return FOCUS_PRIORITY[focus1] - FOCUS_PRIORITY[focus2];
}

// 포커스가 더 높은 우선순위를 가지는지 확인
export function hasHigherPriority(
  focus1: FocusType,
  focus2: FocusType
): boolean {
  return FOCUS_PRIORITY[focus1] > FOCUS_PRIORITY[focus2];
}

// 슬라이드 애니메이션이 허용되는 포커스 타입인지 확인
export function isSlideAnimationAllowed(focus: FocusType): boolean {
  return focus === "dashboard";
}

// 포커스 타입이 유효한지 확인
export function isValidFocusType(focus: string): focus is FocusType {
  return Object.keys(FOCUS_PRIORITY).includes(focus);
}

// 포커스 히스토리에서 특정 타입의 마지막 인덱스 찾기
export function findLastFocusIndex(
  history: FocusType[],
  focusType: FocusType
): number {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] === focusType) {
      return i;
    }
  }
  return -1;
}

// 포커스 히스토리에서 특정 타입 이전의 포커스 찾기
export function findPreviousFocus(
  history: FocusType[],
  currentFocus: FocusType
): FocusType {
  const currentIndex = history.lastIndexOf(currentFocus);
  if (currentIndex > 0) {
    return history[currentIndex - 1];
  }
  return "dashboard";
}

// 포커스 전환 로그 (개발 환경에서만)
export function logFocusTransition(
  from: FocusType,
  to: FocusType,
  reason?: string
): void {
  if (process.env.NODE_ENV === "development") {
      `[Focus] ${FOCUS_DESCRIPTIONS[from]} → ${FOCUS_DESCRIPTIONS[to]}${
        reason ? ` (${reason})` : ""
      }`
    );
  }
}

// 포커스 상태 검증
export function validateFocusState(
  currentFocus: FocusType,
  history: FocusType[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 현재 포커스가 히스토리의 마지막과 일치하는지 확인
  if (history.length > 0 && history[history.length - 1] !== currentFocus) {
    errors.push("Current focus does not match the last item in history");
  }

  // 히스토리가 비어있지 않은지 확인
  if (history.length === 0) {
    errors.push("Focus history cannot be empty");
  }

  // 모든 히스토리 항목이 유효한 포커스 타입인지 확인
  history.forEach((focus, index) => {
    if (!isValidFocusType(focus)) {
      errors.push(`Invalid focus type at index ${index}: ${focus}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
