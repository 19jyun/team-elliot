import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getMyAcademy,
  changeAcademy,
  createAndJoinAcademy,
  updateAcademy,
} from "@/api/teacher";
import { Academy, CreateAcademyRequest } from "@/types/api/teacher";

export function useAcademyManagement() {
  const [currentAcademy, setCurrentAcademy] = useState<Academy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [pendingJoinCode, setPendingJoinCode] = useState("");

  useEffect(() => {
    loadCurrentAcademy();
  }, []);

  const loadCurrentAcademy = async () => {
    try {
      setIsLoading(true);
      const academy = await getMyAcademy();
      setCurrentAcademy(academy);
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
      setWithdrawalModal(true);
      return;
    }

    // 학원에 가입되어 있지 않은 경우 바로 가입
    await performJoinAcademy(joinCode.trim());
  };

  const performJoinAcademy = async (code: string) => {
    try {
      setIsJoining(true);
      const academy = await changeAcademy({ code });
      setCurrentAcademy(academy);
      setJoinCode("");
      setPendingJoinCode("");
      toast.success("학원에 성공적으로 가입했습니다.");
    } catch (error: any) {
      console.error("학원 가입 실패:", error);
      toast.error(error.response?.data?.message || "학원 가입에 실패했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleWithdrawalConfirm = async () => {
    setWithdrawalModal(false);
    await performJoinAcademy(pendingJoinCode);
  };

  const handleCreateAcademy = async (formData: CreateAcademyRequest) => {
    try {
      setIsLoading(true);
      const result = await createAndJoinAcademy(formData);
      setCurrentAcademy(result.academy);
      toast.success("새 학원이 생성되고 자동으로 소속되었습니다.");
      return result.academy;
    } catch (error: any) {
      console.error("학원 생성 실패:", error);
      toast.error(error.response?.data?.message || "학원 생성에 실패했습니다.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAcademy = async (formData: CreateAcademyRequest) => {
    try {
      setIsLoading(true);
      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        description: formData.description,
      };
      const updatedAcademy = await updateAcademy(updateData);
      setCurrentAcademy(updatedAcademy);
      toast.success("학원 정보가 수정되었습니다.");
      return updatedAcademy;
    } catch (error: any) {
      console.error("학원 정보 수정 실패:", error);
      toast.error(
        error.response?.data?.message || "학원 정보 수정에 실패했습니다."
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 선생님이 해당 학원의 관리자인지 확인
  const isAcademyAdmin = () => {
    return currentAcademy?.adminId !== undefined;
  };

  return {
    currentAcademy,
    isLoading,
    joinCode,
    setJoinCode,
    isJoining,
    withdrawalModal,
    setWithdrawalModal,
    handleJoinAcademy,
    handleWithdrawalConfirm,
    handleCreateAcademy,
    handleUpdateAcademy,
    isAcademyAdmin,
    loadCurrentAcademy,
  };
}
