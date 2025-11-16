import { useMutation } from "@tanstack/react-query";
import { signup, signupPrincipal } from "@/api/auth";
import { toast } from "sonner";
import type {
  SignupRequest,
  SignupResponse,
  PrincipalSignupRequest,
  PrincipalSignupResponse,
} from "@/types/api/auth";

/**
 * Student/Teacher 회원가입 Mutation
 */
export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupRequest): Promise<SignupResponse> => {
      const response = await signup(data);
      return response.data!;
    },

    // 성공 시
    onSuccess: () => {
      toast.success("회원가입이 완료되었습니다");
    },

    // 에러 시
    onError: (error) => {
      console.error("회원가입 오류:", error);
      toast.error("회원가입에 실패했습니다");
    },
  });
}

/**
 * Principal 회원가입 Mutation
 */
export function useSignupPrincipal() {
  return useMutation({
    mutationFn: async (
      data: PrincipalSignupRequest
    ): Promise<PrincipalSignupResponse> => {
      const response = await signupPrincipal(data);
      return response.data!;
    },

    // 성공 시
    onSuccess: () => {
      toast.success("회원가입이 완료되었습니다");
    },

    // 에러 시
    onError: (error) => {
      console.error("회원가입 오류:", error);
      toast.error("회원가입에 실패했습니다");
    },
  });
}
