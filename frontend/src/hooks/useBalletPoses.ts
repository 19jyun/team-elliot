import { useQuery } from "@tanstack/react-query";
import { PoseDifficulty } from "@/types/api/ballet-pose";
import { usePrincipalApi } from "@/hooks/principal/usePrincipalApi";

// 발레 자세 목록 조회
export const useBalletPoses = (difficulty?: PoseDifficulty) => {
  const { fetchBalletPoses } = usePrincipalApi();
  return useQuery({
    queryKey: ["ballet-poses", difficulty],
    queryFn: () => fetchBalletPoses(difficulty),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 발레 자세 상세 조회
export const useBalletPose = (id: number) => {
  const { fetchBalletPose } = usePrincipalApi();
  return useQuery({
    queryKey: ["ballet-pose", id],
    queryFn: () => fetchBalletPose(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
