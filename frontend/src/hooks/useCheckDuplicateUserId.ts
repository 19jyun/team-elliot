import { useState, useCallback } from "react";
import { checkUserId } from "@/api/auth";

export function useCheckDuplicateUserId() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);

  const check = useCallback(async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await checkUserId({ userId });

      // apiClient 인터셉터에 의해 래핑된 응답에서 data.available에 접근
      const available = response.data?.available ?? false;
      setIsDuplicate(!available);
      setLoading(false);
      return available;
    } catch {
      setError("중복 확인에 실패했습니다.");
      setLoading(false);
      setIsDuplicate(null);
      return false;
    }
  }, []);

  return { check, loading, error, isDuplicate };
}
