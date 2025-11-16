import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { approvePrincipalEnrollment } from '@/api/principal';
import { toast } from 'sonner';
import type { GetSessionEnrollmentsResponse } from '@/types/api/class-session';

/**
 * Principal 수강신청 승인 Mutation
 */
export function useApproveEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: number) => {
      const response = await approvePrincipalEnrollment(enrollmentId);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async (enrollmentId) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: queryKeys.principal.enrollments.lists(),
      });

      // 이전 데이터 백업
      const previousEnrollments = queryClient.getQueryData<GetSessionEnrollmentsResponse[]>(
        queryKeys.principal.enrollments.lists()
      );

      // 낙관적 업데이트
      queryClient.setQueryData<GetSessionEnrollmentsResponse[]>(
        queryKeys.principal.enrollments.lists(),
        (old) => {
          if (!old) return old;
          return old.map(enrollment =>
            enrollment.id === enrollmentId
              ? { ...enrollment, status: 'CONFIRMED' }
              : enrollment
          );
        }
      );

      return { previousEnrollments };
    },

    // 성공 시
    onSuccess: (data, enrollmentId) => {
      // 관련 쿼리 무효화 및 리패칭
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.enrollments.lists(),
      });
      
      // 개별 항목도 업데이트
      queryClient.setQueryData(
        queryKeys.principal.enrollments.detail(enrollmentId),
        data
      );
      
      // 학생 측 캐시도 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.enrollmentHistory.lists(),
      });
      
      // 캘린더 세션도 무효화 (수강신청 상태 변경 시)
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.calendarSessions.lists(),
      });

      toast.success('수강신청이 승인되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, enrollmentId, context) => {
      if (context?.previousEnrollments) {
        queryClient.setQueryData(
          queryKeys.principal.enrollments.lists(),
          context.previousEnrollments
        );
      }
      toast.error('수강신청 승인에 실패했습니다.');
    },
  });
}

