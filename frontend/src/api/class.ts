import { get } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import type { ClassDetailsResponse } from "@/types/api/class";

// 클래스 상세 조회
export const getClassDetails = (
  classId: number
): Promise<ApiResponse<ClassDetailsResponse>> => {
  return get<ApiResponse<ClassDetailsResponse>>(`/classes/${classId}`);
};
