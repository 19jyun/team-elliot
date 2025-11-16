import { useState } from "react";
import { toast } from "sonner";
import { extractErrorMessage } from "@/types/api/error";
import { useTeacherAcademy } from "@/hooks/queries/teacher/useTeacherAcademy";
import { useTeacherAcademyStatus } from "@/hooks/queries/teacher/useTeacherAcademyStatus";
import { useLeaveAcademy } from "@/hooks/mutations/teacher/useLeaveAcademy";
import { useRequestJoinAcademy } from "@/hooks/mutations/teacher/useRequestJoinAcademy";
import type { TeacherAcademyStatusResponse } from "@/types/api/teacher";
import type { Academy } from "@/types/api/common";

export function useTeacherAcademyManagement() {
  // React Query 기반 데이터 관리
  const { data: currentAcademyData, isLoading } = useTeacherAcademy();
  const {
    data: academyStatusData,
    isLoading: isLoadingStatus,
    refetch: refetchAcademyStatus,
  } = useTeacherAcademyStatus();

  // 타입 명시적 지정
  const currentAcademy = currentAcademyData as Academy | null | undefined;
  const academyStatus = academyStatusData as
    | TeacherAcademyStatusResponse
    | null
    | undefined;
  const leaveAcademyMutation = useLeaveAcademy();
  const requestJoinAcademyMutation = useRequestJoinAcademy();

  const [joinCode, setJoinCode] = useState("");
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<"leave" | "join">(
    "leave"
  );
  const [pendingJoinCode, setPendingJoinCode] = useState("");

  const handleJoinAcademy = async () => {
    if (!joinCode.trim()) {
      toast.error("학원 코드를 입력해주세요.");
      return;
    }

    // 이미 학원에 가입되어 있는 경우 탈퇴 확인 모달 표시
    if (currentAcademy) {
      setPendingJoinCode(joinCode.trim());
      setWithdrawalType("join");
      setWithdrawalModal(true);
      return;
    }

    // 학원에 가입되어 있지 않은 경우 바로 가입 요청
    await performJoinAcademyRequest(joinCode.trim());
  };

  const performJoinAcademyRequest = async (code: string) => {
    try {
      await requestJoinAcademyMutation.mutateAsync({ code });
      setJoinCode("");
      setPendingJoinCode("");
      // 가입 요청 후 상태 다시 로드
      await refetchAcademyStatus();
    } catch (error: unknown) {
      console.error("학원 가입 요청 실패:", error);
      toast.error(extractErrorMessage(error, "학원 가입 요청에 실패했습니다."));
    }
  };

  const handleWithdrawalConfirm = async () => {
    setWithdrawalModal(false);

    // 새 학원 가입을 위한 탈퇴인 경우
    if (withdrawalType === "join" && pendingJoinCode) {
      try {
        // 먼저 현재 학원 탈퇴
        await leaveAcademyMutation.mutateAsync();

        // 그 다음 새 학원 가입 요청
        await performJoinAcademyRequest(pendingJoinCode);
      } catch (error: unknown) {
        console.error("학원 변경 실패:", error);
        toast.error(extractErrorMessage(error, "학원 변경에 실패했습니다."));
      }
    } else if (withdrawalType === "leave") {
      // 단순 탈퇴인 경우
      try {
        await leaveAcademyMutation.mutateAsync();
        // 데이터 재로드는 mutation의 onSuccess에서 자동으로 처리됨
        await refetchAcademyStatus();
      } catch (error: unknown) {
        console.error("학원 탈퇴 실패:", error);
        toast.error(extractErrorMessage(error, "학원 탈퇴에 실패했습니다."));
      }
    }
  };

  const handleLeaveAcademy = () => {
    setWithdrawalType("leave");
    setWithdrawalModal(true);
  };

  return {
    currentAcademy,
    isLoading,
    joinCode,
    setJoinCode,
    isJoining: requestJoinAcademyMutation.isPending,
    withdrawalModal,
    setWithdrawalModal,
    withdrawalType,
    academyStatus,
    isLoadingStatus,
    loadCurrentAcademy: () => {}, // React Query가 자동으로 관리하므로 빈 함수
    loadAcademyStatus: () => refetchAcademyStatus(), // refetch 함수 제공
    handleJoinAcademy,
    handleWithdrawalConfirm,
    handleLeaveAcademy,
  };
}
