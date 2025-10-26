import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateSessionContentRequest,
  ReorderSessionContentsRequest,
  UpdateSessionPosesRequest,
  SessionContentResponse,
} from "@/types/api/session-content";
import { UpdateSessionSummaryRequest } from "@/types/api/teacher";
import { toast } from "sonner";
import {
  getSessionContents,
  createSessionContent,
  deleteSessionContent,
  reorderSessionContents,
  updateSessionPoses,
  checkAttendance,
} from "@/api/session-content";
import { updateSessionSummary } from "@/api/teacher";
import { useSession } from "@/lib/auth/AuthProvider";

// 세션 내용 목록 조회
export const useSessionContents = (sessionId: number) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  return useQuery({
    queryKey: ["session-contents", sessionId, userRole],
    queryFn: async (): Promise<SessionContentResponse> => {
      const response = await getSessionContents(sessionId);
      return response.data || { contents: [] }; // undefined인 경우 기본값 제공
    },
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 세션 내용 추가
export const useAddSessionContent = (sessionId: number) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  return useMutation({
    mutationFn: async (data: CreateSessionContentRequest) => {
      const response = await createSessionContent(sessionId, data);
      return response.data;
    },
    onSuccess: () => {
      // 역할에 따라 적절한 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId, userRole],
      });

      if (userRole === "TEACHER") {
        queryClient.invalidateQueries({
          queryKey: ["teacher-classes-with-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["teacher-profile"],
        });
      } else if (userRole === "PRINCIPAL") {
        queryClient.invalidateQueries({
          queryKey: ["principal-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["principal-profile"],
        });
      }

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
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  return useMutation({
    mutationFn: async (contentId: number) => {
      const response = await deleteSessionContent(sessionId, contentId);
      return response.data;
    },
    onSuccess: () => {
      // 역할에 따라 적절한 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId, userRole],
      });

      if (userRole === "TEACHER") {
        queryClient.invalidateQueries({
          queryKey: ["teacher-classes-with-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["teacher-profile"],
        });
      } else if (userRole === "PRINCIPAL") {
        queryClient.invalidateQueries({
          queryKey: ["principal-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["principal-profile"],
        });
      }

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
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  return useMutation({
    mutationFn: async (data: ReorderSessionContentsRequest) => {
      const response = await reorderSessionContents(sessionId, data);
      return response.data;
    },
    onSuccess: () => {
      // 역할에 따라 적절한 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId, userRole],
      });

      if (userRole === "TEACHER") {
        queryClient.invalidateQueries({
          queryKey: ["teacher-classes-with-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["teacher-profile"],
        });
      } else if (userRole === "PRINCIPAL") {
        queryClient.invalidateQueries({
          queryKey: ["principal-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["principal-profile"],
        });
      }

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
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  return useMutation({
    mutationFn: async (data: UpdateSessionSummaryRequest) => {
      const response = await updateSessionSummary(sessionId, data);
      return response.data;
    },
    onSuccess: () => {
      // 역할에 따라 적절한 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId, userRole],
      });

      if (userRole === "TEACHER") {
        queryClient.invalidateQueries({
          queryKey: ["teacher-classes-with-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["teacher-profile"],
        });
      } else if (userRole === "PRINCIPAL") {
        queryClient.invalidateQueries({
          queryKey: ["principal-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["principal-profile"],
        });
      }

      toast.success("수업내용 요약이 저장되었습니다.");
    },
    onError: (error) => {
      console.error("수업내용 요약 저장 실패:", error);
      toast.error("수업내용 요약 저장에 실패했습니다.");
    },
  });
};

// 세션 자세 목록 전체 업데이트 (새로운 방식)
export const useUpdateSessionPoses = (sessionId: number) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  return useMutation({
    mutationFn: async (data: UpdateSessionPosesRequest) => {
      const response = await updateSessionPoses(sessionId, data);
      return response.data;
    },
    onSuccess: () => {
      // 역할에 따라 적절한 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["session-contents", sessionId, userRole],
      });

      if (userRole === "TEACHER") {
        queryClient.invalidateQueries({
          queryKey: ["teacher-classes-with-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["teacher-profile"],
        });
      } else if (userRole === "PRINCIPAL") {
        queryClient.invalidateQueries({
          queryKey: ["principal-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["principal-profile"],
        });
      }

      toast.success("수업 자세가 저장되었습니다.");
    },
    onError: (error) => {
      console.error("수업 자세 저장 실패:", error);
      toast.error("수업 자세 저장에 실패했습니다.");
    },
  });
};

// 출석 체크
export const useCheckAttendance = (enrollmentId: number) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  return useMutation({
    mutationFn: async (status: "ATTENDED" | "ABSENT") => {
      const response = await checkAttendance(enrollmentId, { status });
      return response.data;
    },
    onSuccess: () => {
      // 역할에 따라 적절한 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["session-contents"],
      });

      if (userRole === "TEACHER") {
        queryClient.invalidateQueries({
          queryKey: ["teacher-classes-with-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["teacher-profile"],
        });
      } else if (userRole === "PRINCIPAL") {
        queryClient.invalidateQueries({
          queryKey: ["principal-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["principal-profile"],
        });
      }

      toast.success("출석 정보가 저장되었습니다.");
    },
    onError: (error) => {
      console.error("출석 체크 실패:", error);
      toast.error("출석 체크에 실패했습니다.");
    },
  });
};

// 일괄 출석 체크
export const useBatchCheckAttendance = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";

  return useMutation({
    mutationFn: async (
      attendanceData: { enrollmentId: number; status: "ATTENDED" | "ABSENT" }[]
    ) => {
      const promises = attendanceData.map(({ enrollmentId, status }) =>
        checkAttendance(enrollmentId, { status })
      );
      const responses = await Promise.all(promises);
      return responses.map((response) => response.data);
    },
    onSuccess: () => {
      // 모든 세션 컨텐츠 쿼리 무효화 (출석체크는 모든 세션에 영향)
      queryClient.invalidateQueries({
        queryKey: ["session-contents"],
      });

      // 역할에 따라 관련 쿼리 무효화
      if (userRole === "TEACHER") {
        queryClient.invalidateQueries({
          queryKey: ["teacher-classes-with-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["teacher-profile"],
        });
        // Teacher 세션 수강생 목록도 무효화
        queryClient.invalidateQueries({
          queryKey: ["teacher-session-enrollments"],
        });
      } else if (userRole === "PRINCIPAL") {
        queryClient.invalidateQueries({
          queryKey: ["principal-sessions"],
        });
        queryClient.invalidateQueries({
          queryKey: ["principal-profile"],
        });
        // Principal 세션 수강생 목록도 무효화
        queryClient.invalidateQueries({
          queryKey: ["principal-session-enrollments"],
        });
      }

      toast.success("출석 정보가 저장되었습니다.");
    },
    onError: (error: unknown) => {
      console.error("출석 체크 실패:", error);

      // 출석 체크 날짜 제한 에러 처리
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ATTENDANCE_CHECK_INVALID_DATE"
      ) {
        toast.error("출석 체크는 수업 당일에만 가능합니다.");
      } else {
        toast.error("출석 체크에 실패했습니다.");
      }
    },
  });
};
