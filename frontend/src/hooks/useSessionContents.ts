import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  CreateSessionContentRequest,
  UpdateSessionContentRequest,
  ReorderSessionContentsRequest,
} from "@/types/api/session-content";
import { toast } from "sonner";

// 세션 내용 목록 조회
export const useSessionContents = (sessionId: number) => {
  return useQuery({
    queryKey: ["session-contents", sessionId],
    queryFn: async () => {
      const res = await axios.get(`/class-sessions/${sessionId}/contents`);
      return res.data.data;
    },
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 세션 내용 추가
export const useAddSessionContent = (sessionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionContentRequest) => {
      const res = await axios.post(
        `/class-sessions/${sessionId}/contents`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId],
      });
      toast.success("세션 내용이 추가되었습니다.");
    },
    onError: (error) => {
      console.error("세션 내용 추가 실패:", error);
      toast.error("세션 내용 추가에 실패했습니다.");
    },
  });
};

// 세션 내용 수정
export const useUpdateSessionContent = (sessionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      data,
    }: {
      contentId: number;
      data: UpdateSessionContentRequest;
    }) =>
      axios
        .patch(`/class-sessions/${sessionId}/contents/${contentId}`, data)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId],
      });
      toast.success("세션 내용이 수정되었습니다.");
    },
    onError: (error) => {
      console.error("세션 내용 수정 실패:", error);
      toast.error("세션 내용 수정에 실패했습니다.");
    },
  });
};

// 세션 내용 삭제
export const useDeleteSessionContent = (sessionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: number) =>
      axios
        .delete(`/class-sessions/${sessionId}/contents/${contentId}`)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId],
      });
      toast.success("세션 내용이 삭제되었습니다.");
    },
    onError: (error) => {
      console.error("세션 내용 삭제 실패:", error);
      toast.error("세션 내용 삭제에 실패했습니다.");
    },
  });
};

// 세션 내용 순서 변경
export const useReorderSessionContents = (sessionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReorderSessionContentsRequest) => {
      const ids =
        (data as unknown as { orderedContentIds?: number[] })
          .orderedContentIds ??
        (data as unknown as { contentIds?: number[] }).contentIds ??
        [];
      const contentIds: string[] = (ids as Array<string | number>).map(String);
      const res = await axios.patch(
        `/class-sessions/${sessionId}/contents/reorder`,
        { contentIds }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId],
      });
      toast.success("순서가 변경되었습니다.");
    },
    onError: (error) => {
      console.error("순서 변경 실패:", error);
      toast.error("순서 변경에 실패했습니다.");
    },
  });
};
