// UI 컴포넌트에서 공통으로 사용되는 타입들
import type { LevelType } from "@/types/api/common";

// 탭 타입들
export type TabType = "class" | "session";

// API 에러 타입
export interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

// 브라운 테마 색상 정의
export const brownTheme = {
  primary: "[#ac9592]",
  secondary: "[#9a8582]",
  light: "[#ac9592]",
  border: "[#9a8582]",
  hover: "[#8a7572]",
} as const;

// 레벨별 배경색
export const levelBgColor: Record<LevelType, string> = {
  BEGINNER: "#F4E7E7",
  INTERMEDIATE: "#FBF4D8",
  ADVANCED: "#CBDFE3",
};

// 레벨별 뱃지 텍스트
export const levelBadgeText: Record<LevelType, string> = {
  BEGINNER: "비기너",
  INTERMEDIATE: "초급",
  ADVANCED: "고급",
};

// 정책 관련 타입들
export interface PolicySectionData {
  title: string;
  content: string[];
}

export interface PolicyData {
  sections: PolicySectionData[];
}
