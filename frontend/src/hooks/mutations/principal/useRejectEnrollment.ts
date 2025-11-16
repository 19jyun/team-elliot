import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/queryKeys';
import { rejectPrincipalEnrollment } from '@/api/principal';
import { toast } from 'sonner';
import type { GetSessionEnrollmentsResponse } from '@/types/api/class-session';
import type { RejectEnrollmentRequest } from '@/types/api/principal';

/**
 * Principal 수강신청 거절 Mutation
 */
export function useRejectEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enrollmentId, data }: { enrollmentId: number; data: RejectEnrollmentRequest }) => {
      const response = await rejectPrincipalEnrollment(enrollmentId, data);
      return response.data;
    },
    
    // 낙관적 업데이트
    onMutate: async ({ enrollmentId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.principal.enrollments.lists(),
      });

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
              ? { ...enrollment, status: 'REJECTED' }
              : enrollment
          );
        }
      );

      return { previousEnrollments };
    },

    // 성공 시
    onSuccess: (data, { enrollmentId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.enrollments.lists(),
      });
      
      queryClient.setQueryData(
        queryKeys.principal.enrollments.detail(enrollmentId),
        data
      );
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.enrollmentHistory.lists(),
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.principal.calendarSessions.lists(),
      });

      toast.success('수강신청이 거절되었습니다.');
    },

    // 에러 시 롤백
    onError: (error, { enrollmentId }, context) => {
      if (context?.previousEnrollments) {
        queryClient.setQueryData(
          queryKeys.principal.enrollments.lists(),
          context.previousEnrollments
        );
      }
      toast.error('수강신청 거절에 실패했습니다.');
    },
  });
}

