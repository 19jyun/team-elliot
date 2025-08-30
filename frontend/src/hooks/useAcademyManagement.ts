import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getMyAcademy, leaveAcademy, requestJoinAcademy } from "@/api/teacher";
import { Academy } from "@/types/api/teacher";

export function useAcademyManagement() {
  const [currentAcademy, setCurrentAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<"leave" | "join">(
    "leave"
  );
  const [pendingJoinCode, setPendingJoinCode] = useState("");

  useEffect(() => {
    loadCurrentAcademy();
  }, []);

  const loadCurrentAcademy = async () => {
    try {
      setIsLoading(true);
      const academy = await getMyAcademy();
      setCurrentAcademy(academy.data);
    } catch (error) {
      console.error("학원 정보 로드 실패:", error);
      toast.error("학원 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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
      setIsJoining(true);
      await requestJoinAcademy({ code });
      setJoinCode("");
      setPendingJoinCode("");
      toast.success("학원 가입 요청이 완료되었습니다.");
    } catch (error: any) {
      console.error("학원 가입 요청 실패:", error);
      toast.error(
        error.response?.data?.message || "학원 가입 요청에 실패했습니다."
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleWithdrawalConfirm = async () => {
    setWithdrawalModal(false);

    // 새 학원 가입을 위한 탈퇴인 경우
    if (withdrawalType === "join" && pendingJoinCode) {
      try {
        // 먼저 현재 학원 탈퇴
        await leaveAcademy();
        setCurrentAcademy(null);
        toast.success("학원에서 탈퇴되었습니다.");

        // 그 다음 새 학원 가입 요청
        await performJoinAcademyRequest(pendingJoinCode);
      } catch (error: any) {
        console.error("학원 변경 실패:", error);
        toast.error(
          error.response?.data?.message || "학원 변경에 실패했습니다."
        );
      }
      return;
    }

    // 단순 탈퇴인 경우
    try {
      await leaveAcademy();
      setCurrentAcademy(null);
      toast.success("학원에서 탈퇴되었습니다.");
    } catch (error: any) {
      console.error("학원 탈퇴 실패:", error);
      toast.error(error.response?.data?.message || "학원 탈퇴에 실패했습니다.");
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
    isJoining,
    withdrawalModal,
    setWithdrawalModal,
    withdrawalType,
    handleJoinAcademy,
    handleWithdrawalConfirm,
    handleLeaveAcademy,
    loadCurrentAcademy,
  };
}
