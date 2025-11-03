import { useCallback } from "react";
import { useSession, useSignOut } from "@/lib/auth/AuthProvider";
import { AuthRouter } from "@/lib/auth/AuthRouter";
import { toast } from "sonner";
import {
  withdrawalStudent as apiWithdrawalStudent,
  withdrawalTeacher as apiWithdrawalTeacher,
  withdrawalPrincipal as apiWithdrawalPrincipal,
} from "@/api/auth";
import { useAppDispatch } from "@/store/hooks";
import { clearPrincipalData } from "@/store/slices/principalSlice";
import { clearStudentData } from "@/store/slices/studentSlice";
import { clearApiClientSessionCache } from "@/api/apiClient";
import { logger } from "@/lib/logger";
import { WithdrawalErrorCode, isWithdrawalError } from "@/types/withdrawal";

export const useWithdrawal = () => {
  const { data: session } = useSession();
  const signOut = useSignOut();
  const dispatch = useAppDispatch();

  const withdrawal = useCallback(
    async (reason: string) => {
      try {
        // 세션이 없으면 이미 로그아웃된 상태
        if (!session?.user) {
          AuthRouter.redirectToLogin();
          return;
        }

        // 1. 역할에 따라 적절한 회원 탈퇴 API 호출
        const userRole = session.user.role;
        if (userRole === "TEACHER") {
          await apiWithdrawalTeacher({ reason });
        } else if (userRole === "PRINCIPAL") {
          await apiWithdrawalPrincipal({ reason });
        } else {
          // STUDENT 또는 기타 역할
          await apiWithdrawalStudent({ reason });
        }

        // 2. 소켓 연결 완전 해제
        if (typeof window !== "undefined") {
          const { disconnectSocket } = await import("@/lib/socket");
          await disconnectSocket();
        }

        // 3. Redux 상태 완전 정리 (모든 역할의 데이터)
        dispatch(clearPrincipalData());
        dispatch(clearStudentData());

        // 3-1. API 클라이언트 세션 캐시 클리어
        clearApiClientSessionCache();

        // 3-1-1. 브라우저 캐시 클리어
        if (typeof window !== "undefined") {
          const { SyncStorage } = await import("@/lib/storage/StorageAdapter");
          SyncStorage.removeItem("next-auth.session-token");
          SyncStorage.removeItem("next-auth.csrf-token");
          sessionStorage.clear();
        }

        // 3-2. 초기화 상태 리셋을 위한 전역 이벤트 발생
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("logout-cleanup"));
        }

        // 4. NextAuth 세션 완전 정리
        await signOut({ redirect: false });

        // 5. 성공 메시지
        toast.success("회원 탈퇴가 완료되었습니다");

        // 6. 세션 정리 완료 후 리디렉션
        setTimeout(() => {
          AuthRouter.redirectToLogin();
        }, 500);

        logger.info("회원 탈퇴 완료", {
          userId: session.user.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error: unknown) {
        // 타입 가드를 사용하여 에러 구조 확인
        if (!isWithdrawalError(error)) {
          // 예상치 못한 에러 (네트워크 에러 등)
          logger.error("회원 탈퇴 실패 (예상치 못한 에러)", {
            error: error instanceof Error ? error.message : String(error),
          });

          toast.error("회원 탈퇴 중 오류가 발생했습니다", {
            description: "잠시 후 다시 시도해주세요.",
            duration: 4000,
          });

          // cleanup 진행
          try {
            dispatch(clearPrincipalData());
            dispatch(clearStudentData());
            await signOut({ redirect: false });
          } catch (cleanupError) {
            logger.error("Cleanup failed", {
              error:
                cleanupError instanceof Error
                  ? cleanupError.message
                  : String(cleanupError),
            });
          }

          setTimeout(() => {
            AuthRouter.redirectToLogin();
          }, 500);

          return;
        }

        // 백엔드 에러 응답 파싱 (타입 안정성 확보)
        const errorData = error.response?.data;
        const errorCode = errorData?.error?.code;
        const errorMessage = errorData?.error?.message;
        const errorDetails = errorData?.error?.details;

        logger.error("회원 탈퇴 실패", {
          error: error instanceof Error ? error.message : String(error),
          errorCode,
        });

        // 에러 코드에 따른 toast 메시지 표시
        switch (errorCode) {
          case WithdrawalErrorCode.HAS_ONGOING_CLASSES: {
            const classCount = errorDetails?.ongoingClassCount || 0;
            const classList = errorDetails?.classes || [];

            toast.error("진행 중인 수업이 있어 탈퇴할 수 없습니다", {
              description: `${classCount}개의 진행 중인 수업을 먼저 종료해주세요.`,
              duration: 5000,
            });

            // 진행 중인 수업 목록 로그
            if (classList.length > 0) {
              logger.info("진행 중인 수업 목록", { classes: classList });
            }
            return; // cleanup 및 로그아웃 하지 않음
          }

          case WithdrawalErrorCode.HAS_PENDING_REFUNDS: {
            const refundCount = errorDetails?.pendingRefundCount || 0;

            toast.error("처리되지 않은 환불 요청이 있습니다", {
              description: `${refundCount}개의 환불 요청을 먼저 처리해주세요.`,
              duration: 5000,
            });
            return; // cleanup 및 로그아웃 하지 않음
          }

          case WithdrawalErrorCode.HAS_PENDING_ENROLLMENTS: {
            const enrollmentCount = errorDetails?.pendingEnrollmentCount || 0;

            toast.error("처리되지 않은 수강 신청이 있습니다", {
              description: `${enrollmentCount}개의 수강 신청을 먼저 처리해주세요.`,
              duration: 5000,
            });
            return; // cleanup 및 로그아웃 하지 않음
          }

          default:
            // 기타 백엔드 에러 메시지 표시
            toast.error(errorMessage || "회원 탈퇴 중 오류가 발생했습니다", {
              duration: 4000,
            });
            break;
        }

        // 비즈니스 에러가 아닌 경우에만 cleanup 진행
        try {
          dispatch(clearPrincipalData());
          dispatch(clearStudentData());
          await signOut({ redirect: false });
        } catch (cleanupError) {
          logger.error("Cleanup failed", {
            error:
              cleanupError instanceof Error
                ? cleanupError.message
                : String(cleanupError),
          });
        }

        setTimeout(() => {
          AuthRouter.redirectToLogin();
        }, 500);
      }
    },
    [session, signOut, dispatch]
  );

  return { withdrawal };
};
