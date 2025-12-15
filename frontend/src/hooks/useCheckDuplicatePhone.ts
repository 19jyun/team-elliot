import { useState, useCallback } from "react";
import { checkPhoneNumber } from "@/api/auth";

export function useCheckDuplicatePhone() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);

  const check = useCallback(async (phoneNumber: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await checkPhoneNumber({ phoneNumber });
      const available = response.data?.available ?? false;
      setIsDuplicate(!available);
      setLoading(false);
      return available;
    } catch {
      setError("전화번호 중복 확인에 실패했습니다.");
      setLoading(false);
      setIsDuplicate(null);
      return false;
    }
  }, []);

  return { check, loading, error, isDuplicate };
}
