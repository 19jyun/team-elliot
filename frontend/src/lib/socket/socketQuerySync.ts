import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import type { SocketEventData, SocketEventName } from "@/types/socket";

/**
 * Socket 이벤트를 React Query 캐시 무효화로 변환하는 클래스
 *
 * Socket.IO 이벤트를 받아서 관련된 React Query 캐시를 자동으로 무효화하여
 * 실시간 업데이트를 구현합니다.
 */
export class SocketQuerySync {
  constructor(private queryClient: QueryClient) {}

  /**
   * Socket 이벤트를 처리하여 관련된 React Query 캐시를 무효화
   *
   * @param event Socket 이벤트 이름
   * @param data Socket 이벤트 데이터
   */
  handleSocketEvent(
    event: SocketEventName | string,
    data: SocketEventData<SocketEventName> | Record<string, unknown>
  ) {
    switch (event) {
      // ==================== 수강신청 관련 ====================
      case "new_enrollment_request":
        // Principal 수강신청 목록 무효화
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.enrollments.lists(),
        });
        break;

      case "enrollment_accepted":
      case "enrollment_rejected":
        // Principal 수강신청 목록 및 개별 항목 무효화
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.enrollments.lists(),
        });

        if ("enrollmentId" in data && typeof data.enrollmentId === "number") {
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.principal.enrollments.detail(data.enrollmentId),
          });
        }

        // Student 측 캐시도 무효화
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.student.enrollmentHistory.lists(),
        });

        // 캘린더 세션 무효화 (수강신청 상태 변경 시)
        this.queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              (Array.isArray(key) &&
                key.length >= 2 &&
                key[1] === "calendarSessions") ||
              (Array.isArray(key) &&
                key.length >= 3 &&
                key[2] === "calendarSessions")
            );
          },
        });
        break;

      // ==================== 환불 요청 관련 ====================
      case "new_refund_request":
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.refundRequests.lists(),
        });
        break;

      case "refund_accepted":
      case "refund_rejected":
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.refundRequests.lists(),
        });

        if ("refundId" in data && typeof data.refundId === "number") {
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.principal.refundRequests.detail(data.refundId),
          });
        }

        // Student 측 캐시도 무효화
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.student.cancellationHistory.lists(),
        });

        // 캘린더 세션 무효화 (환불 승인 시 세션 제거)
        this.queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              (Array.isArray(key) &&
                key.length >= 2 &&
                key[1] === "calendarSessions") ||
              (Array.isArray(key) &&
                key.length >= 3 &&
                key[2] === "calendarSessions")
            );
          },
        });
        break;

      // ==================== 세션 관련 ====================
      // 세션 생성/수정/삭제 이벤트 (향후 백엔드에서 정의될 수 있음)
      case "session_created":
      case "session_updated":
      case "session_deleted":
        // 모든 역할의 캘린더 세션 무효화
        this.queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              (Array.isArray(key) &&
                key.length >= 2 &&
                key[1] === "calendarSessions") ||
              (Array.isArray(key) &&
                key.length >= 3 &&
                key[2] === "calendarSessions")
            );
          },
        });
        break;

      // ==================== 선생님 가입 신청 관련 ====================
      // 선생님 가입 신청 이벤트 (향후 백엔드에서 정의될 수 있음)
      case "teacher_join_request":
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.teacherJoinRequests.lists(),
        });
        break;

      case "teacher_join_approved":
      case "teacher_join_rejected":
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.teacherJoinRequests.lists(),
        });
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.teachers.lists(),
        });
        break;

      case "class_created":
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.teacher.classes.lists(),
        });
        break;

      case "connection_confirmed":
        // 연결 확인 이벤트는 캐시 무효화 불필요
        break;

      default:
        if (process.env.NODE_ENV === "development") {
          console.warn(`Unhandled socket event: ${event}`, data);
        }
    }
  }

  /**
   * 즉시 캐시 업데이트 (낙관적 업데이트 대신 사용)
   *
   * Socket 이벤트로 받은 데이터를 즉시 캐시에 반영할 때 사용
   *
   * @param queryKey Query Key
   * @param updater 캐시 업데이트 함수
   */
  updateCacheOptimistically<T>(
    queryKey: unknown[],
    updater: (old: T | undefined) => T | undefined
  ) {
    this.queryClient.setQueryData<T>(queryKey, updater);
  }

  /**
   * 특정 쿼리 키 패턴의 모든 쿼리 무효화
   *
   * @param predicate 쿼리 키 필터 함수
   */
  invalidateQueriesByPredicate(
    predicate: (query: { queryKey: unknown[] }) => boolean
  ) {
    this.queryClient.invalidateQueries({ predicate });
  }
}
