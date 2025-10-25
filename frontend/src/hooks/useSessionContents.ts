import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateSessionContentRequest,
  ReorderSessionContentsRequest,
} from "@/types/api/session-content";
import { UpdateSessionSummaryRequest } from "@/types/api/teacher";
import { toast } from "sonner";
import {
  getSessionContents,
  createSessionContent,
  deleteSessionContent,
  reorderSessionContents,
  checkAttendance,
} from "@/api/session-content";
import { updateSessionSummary } from "@/api/teacher";

// 세션 내용 목록 조회
export const useSessionContents = (sessionId: number) => {
  return useQuery({
    queryKey: ["session-contents", sessionId],
    queryFn: async () => {
      const response = await getSessionContents(sessionId);
      return response.data;
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
      const response = await createSessionContent(sessionId, data);
      return response.data;
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

// 세션 내용 삭제
export const useDeleteSessionContent = (sessionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: number) => {
      const response = await deleteSessionContent(sessionId, contentId);
      return response.data;
    },
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
      const response = await reorderSessionContents(sessionId, data);
      return response.data;
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

// 세션 요약 업데이트
export const useUpdateSessionSummary = (sessionId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSessionSummaryRequest) => {
      const response = await updateSessionSummary(sessionId, data);
      return response.data;
    },
    onSuccess: () => {
      // 세션 관련 쿼리들을 모두 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["teacher-classes-with-sessions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["teacher-profile"],
      });
      toast.success("수업내용 요약이 저장되었습니다.");
    },
    onError: (error) => {
      console.error("수업내용 요약 저장 실패:", error);
      toast.error("수업내용 요약 저장에 실패했습니다.");
    },
  });
};

// 출석 체크
export const useCheckAttendance = (enrollmentId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: "ATTENDED" | "ABSENT") => {
      const response = await checkAttendance(enrollmentId, { status });
      return response.data;
    },
    onSuccess: () => {
      // 관련 쿼리들을 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({
        queryKey: ["session-contents"],
      });
      queryClient.invalidateQueries({
        queryKey: ["teacher-classes-with-sessions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["teacher-profile"],
      });
      toast.success("출석 정보가 저장되었습니다.");
    },
    onError: (error) => {
      console.error("출석 체크 실패:", error);
      toast.error("출석 체크에 실패했습니다.");
    },
  });
};
