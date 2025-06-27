import { post } from "./apiClient";
import { CheckUserIdRequest, CheckUserIdResponse } from "../types/api/auth";

export const checkDuplicateUserId = async (
  userId: string
): Promise<CheckUserIdResponse> => {
  return post<CheckUserIdResponse>("/auth/check-userid", {
    userId,
  } as CheckUserIdRequest);
};
