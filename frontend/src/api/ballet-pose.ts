import { get } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import type { BalletPose, PoseDifficulty } from "@/types/api/ballet-pose";

// 발레 포즈 목록 조회
export const getBalletPoses = (
  difficulty?: PoseDifficulty
): Promise<ApiResponse<BalletPose[]>> => {
  return get<ApiResponse<BalletPose[]>>("/ballet-poses", {
    params: difficulty ? { difficulty } : undefined,
  });
};

// 발레 포즈 상세 조회
export const getBalletPose = (id: number): Promise<ApiResponse<BalletPose>> => {
  return get<ApiResponse<BalletPose>>(`/ballet-poses/${id}`);
};
