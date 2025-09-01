// 난이도 관련 유틸리티 함수들

/**
 * 난이도에 따른 CSS 클래스 색상을 반환합니다.
 */
export function getDifficultyColor(difficulty: string): string {
  const colorMap: Record<string, string> = {
    BEGINNER: "bg-red-100 text-red-700",
    INTERMEDIATE: "bg-yellow-100 text-yellow-700",
    ADVANCED: "bg-blue-100 text-blue-700",
  };
  return colorMap[difficulty] || "bg-gray-100 text-gray-700";
}

/**
 * 난이도에 따른 배경 색상을 반환합니다.
 */
export function getDifficultyBgColor(difficulty: string): string {
  const bgColorMap: Record<string, string> = {
    BEGINNER: "#F4E7E7",
    INTERMEDIATE: "#FBF4D8",
    ADVANCED: "#CBDFE3",
  };
  return bgColorMap[difficulty] || "#F4E7E7";
}

/**
 * 난이도를 한글 텍스트로 변환합니다.
 */
export function getDifficultyText(difficulty: string): string {
  const textMap: Record<string, string> = {
    BEGINNER: "초급",
    INTERMEDIATE: "중급",
    ADVANCED: "고급",
  };
  return textMap[difficulty] || difficulty;
}

/**
 * 난이도 타입 정의
 */
export type DifficultyType = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * 난이도 상수
 */
export const DIFFICULTY = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
} as const;
