import { useQuery } from "@tanstack/react-query";
import { getBalletPoses, getBalletPose } from "@/api/ballet-pose";
import { PoseDifficulty } from "@/types/api/ballet-pose";

// 발레 자세 목록 조회
export const useBalletPoses = (difficulty?: PoseDifficulty) => {
  return useQuery({
    queryKey: ["ballet-poses", difficulty],
    queryFn: () => getBalletPoses(difficulty),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 발레 자세 상세 조회
export const useBalletPose = (id: number) => {
  return useQuery({
    queryKey: ["ballet-pose", id],
    queryFn: () => getBalletPose(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
