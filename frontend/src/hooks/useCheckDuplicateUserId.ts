import { useState } from "react";
import { checkDuplicateUserId as checkDuplicateUserIdApi } from "@/api/auth";
import { CheckUserIdResponse } from "@/types/api/auth";

export function useCheckDuplicateUserId() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);

  const check = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response: CheckUserIdResponse = await checkDuplicateUserIdApi(
        userId
      );
      setIsDuplicate(!response.available);
      setLoading(false);
      return response.available;
    } catch (err) {
      setError("중복 확인에 실패했습니다.");
      setLoading(false);
      setIsDuplicate(null);
      return false;
    }
  };

  return { check, loading, error, isDuplicate };
}
