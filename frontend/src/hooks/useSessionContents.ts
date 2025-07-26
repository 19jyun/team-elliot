import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSessionContents,
  addSessionContent,
  updateSessionContent,
  deleteSessionContent,
  reorderSessionContents,
} from "@/api/session-content";
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
    queryFn: () => getSessionContents(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 세션 내용 추가
export const useAddSessionContent = (sessionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionContentRequest) =>
      addSessionContent(sessionId, data),
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
    }) => updateSessionContent(sessionId, contentId, data),
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
      deleteSessionContent(sessionId, contentId),
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
    mutationFn: (data: ReorderSessionContentsRequest) =>
      reorderSessionContents(sessionId, data),
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
