import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useTeacherData } from "@/hooks/redux/useTeacherData";
import { toast } from "sonner";
import {
  getMyAcademy,
  changeAcademy,
  createAndJoinAcademy,
  updateAcademy,
  leaveAcademy,
  requestJoinAcademy,
} from "@/api/teacher";
import { Academy, CreateAcademyRequest } from "@/types/api/teacher";
import {
  setCurrentAcademy,
  clearCurrentAcademy,
  setAcademyLoading,
  setAcademyError,
} from "@/store/slices/teacherSlice";

export function useTeacherAcademyManagement() {
  const dispatch = useAppDispatch();
  const { academy: currentAcademy, isLoading } = useTeacherData();

  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [withdrawalType, setWithdrawalType] = useState<"leave" | "join">(
    "leave"
  );
  const [pendingJoinCode, setPendingJoinCode] = useState("");

  const loadCurrentAcademy = async () => {
    try {
      dispatch(setAcademyLoading(true));
      dispatch(setAcademyError(null));

      const academy = await getMyAcademy();
      dispatch(setCurrentAcademy(academy));
    } catch (error) {
      console.error("학원 정보 로드 실패:", error);
      dispatch(setAcademyError("학원 정보를 불러오는데 실패했습니다."));
      toast.error("학원 정보를 불러오는데 실패했습니다.");
    } finally {
      dispatch(setAcademyLoading(false));
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
      const result = await requestJoinAcademy({ code });
      setJoinCode("");
      setPendingJoinCode("");
      toast.success(result.message);
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
        dispatch(clearCurrentAcademy());
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
      dispatch(clearCurrentAcademy());
      toast.success("학원에서 탈퇴되었습니다.");
    } catch (error: any) {
      console.error("학원 탈퇴 실패:", error);
      toast.error(error.response?.data?.message || "학원 탈퇴에 실패했습니다.");
    }
  };

  const handleCreateAcademy = async (formData: CreateAcademyRequest) => {
    try {
      dispatch(setAcademyLoading(true));
      const academy = await createAndJoinAcademy(formData);
      dispatch(setCurrentAcademy(academy));
      toast.success("학원이 성공적으로 생성되었습니다.");
      return academy;
    } catch (error: any) {
      console.error("학원 생성 실패:", error);
      toast.error(error.response?.data?.message || "학원 생성에 실패했습니다.");
      throw error;
    } finally {
      dispatch(setAcademyLoading(false));
    }
  };

  const handleUpdateAcademy = async (formData: CreateAcademyRequest) => {
    try {
      dispatch(setAcademyLoading(true));
      const academy = await updateAcademy(formData);
      dispatch(setCurrentAcademy(academy));
      toast.success("학원 정보가 성공적으로 수정되었습니다.");
      return academy;
    } catch (error: any) {
      console.error("학원 수정 실패:", error);
      toast.error(error.response?.data?.message || "학원 수정에 실패했습니다.");
      throw error;
    } finally {
      dispatch(setAcademyLoading(false));
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
    loadCurrentAcademy,
    handleJoinAcademy,
    handleWithdrawalConfirm,
    handleCreateAcademy,
    handleUpdateAcademy,
    handleLeaveAcademy,
  };
}
