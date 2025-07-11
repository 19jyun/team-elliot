import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UsePhoneVerificationProps {
  phoneNumber: string;
  isEditMode?: boolean;
  originalPhoneNumber?: string;
}

export function usePhoneVerification({
  phoneNumber,
  isEditMode = false,
  originalPhoneNumber = "",
}: UsePhoneVerificationProps) {
  const [isPhoneVerificationRequired, setIsPhoneVerificationRequired] =
    useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsPhoneVerificationRequired(false);
            setIsPhoneVerified(false);
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // 전화번호 변경 감지 (수정 모드에서는 기존 번호와 다를 때만 인증 필요)
  useEffect(() => {
    if (phoneNumber && phoneNumber.length === 11) {
      if (isEditMode && originalPhoneNumber) {
        // 수정 모드: 기존 번호와 다를 때만 인증 필요
        if (phoneNumber !== originalPhoneNumber) {
          setIsPhoneVerificationRequired(true);
          setIsPhoneVerified(false);
          setTimeLeft(180);
          setIsTimerRunning(false);
        } else {
          setIsPhoneVerificationRequired(false);
          setIsPhoneVerified(false);
          setIsTimerRunning(false);
          setTimeLeft(180);
          setVerificationCode("");
        }
      } else {
        // 생성 모드: 항상 인증 필요
        setIsPhoneVerificationRequired(true);
        setIsPhoneVerified(false);
        setTimeLeft(180);
        setIsTimerRunning(false);
      }
    } else if (!phoneNumber || phoneNumber.length !== 11) {
      setIsPhoneVerificationRequired(false);
      setIsPhoneVerified(false);
      setIsTimerRunning(false);
      setTimeLeft(180);
      setVerificationCode("");
    }
  }, [phoneNumber, isEditMode, originalPhoneNumber]);

  const handleVerifyPhone = () => {
    // 인증 버튼 클릭 시 타이머 시작
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setTimeLeft(180);
      toast.success("인증번호가 발송되었습니다.");
      return;
    }

    // 확인 버튼 클릭 시 인증 완료 처리
    setIsPhoneVerified(true);
    setIsTimerRunning(false);
    setVerificationCode("");
    toast.success("전화번호 인증이 완료되었습니다.");
  };

  const handleClearVerificationCode = () => {
    setVerificationCode("");
  };

  const resetVerification = () => {
    setIsPhoneVerificationRequired(false);
    setIsPhoneVerified(false);
    setIsTimerRunning(false);
    setTimeLeft(180);
    setVerificationCode("");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return {
    isPhoneVerificationRequired,
    isPhoneVerified,
    verificationCode,
    setVerificationCode,
    timeLeft,
    isTimerRunning,
    handleVerifyPhone,
    handleClearVerificationCode,
    resetVerification,
    formatTime,
  };
}
