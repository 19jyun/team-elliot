import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { stableQueryOptions } from "@/lib/react-query/queryOptions";
import { getBalletPoses } from "@/api/ballet-pose";
import type { PoseDifficulty } from "@/types/api/ballet-pose";
import type { BalletPose } from "@/types/api/ballet-pose";

// 발레 자세 목록 조회
export const useBalletPoses = (difficulty?: PoseDifficulty) => {
  return useQuery({
    queryKey: queryKeys.common.balletPoses.list(difficulty),
    queryFn: async (): Promise<BalletPose[]> => {
      const response = await getBalletPoses(difficulty);
      return response.data || [];
    },
    ...stableQueryOptions,
    staleTime: 5 * 60 * 1000, // 5분
  });
};
