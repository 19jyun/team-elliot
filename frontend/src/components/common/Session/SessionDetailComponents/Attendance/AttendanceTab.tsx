import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkAttendance } from '@/api/class-sessions';
import { SessionEnrollment } from '@/types/api/teacher';
import { toast } from 'sonner';
import { AttendanceCard } from './AttendanceCard';

interface AttendanceTabProps {
  sessionId: number;
  enrollments: SessionEnrollment[];
  isLoading: boolean;
}

export function AttendanceTab({ sessionId, enrollments, isLoading }: AttendanceTabProps) {
  const queryClient = useQueryClient();
  const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState<number | null>(null);

  const attendanceMutation = useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: number; status: 'ATTENDED' | 'ABSENT' }) =>
      checkAttendance(enrollmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-enrollments', sessionId] });
      setUpdatingEnrollmentId(null);
      toast.success('출석 상태가 업데이트되었습니다.');
    },
    onError: (error: any) => {
      // 개발 환경에서만 에러 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('출석 체크 실패:', error);
      }
      setUpdatingEnrollmentId(null);
      
      // 서버에서 받은 에러 메시지 처리
      let errorMessage = '출석 체크에 실패했습니다.';
      
      if (error?.response?.data?.message) {
        // 서버에서 전달된 메시지가 있으면 사용
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 400) {
        // 400 에러인 경우 기본 메시지
        errorMessage = '출석 체크는 수업 당일에만 가능합니다.';
      } else if (error?.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (error?.response?.status === 403) {
        errorMessage = '출석 체크 권한이 없습니다.';
      } else if (error?.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      toast.error(errorMessage);
    },
  });

  const handleAttendanceChange = (enrollmentId: number, status: 'ATTENDED' | 'ABSENT') => {
    setUpdatingEnrollmentId(enrollmentId);
    attendanceMutation.mutate({ enrollmentId, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 출석 현황 요약 - 확정 레이블 제거 */}
      <div className="bg-[#ac9592] rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-2">출석 현황</h3>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-[#9a8582] text-white">
            출석: {enrollments.filter(e => e.status === 'ATTENDED').length}명
          </span>
          <span className="px-2 py-1 rounded bg-[#8a7572] text-white">
            결석: {enrollments.filter(e => e.status === 'ABSENT').length}명
          </span>
        </div>
      </div>

      {/* 수강생 목록 */}
      <div className="space-y-3">
        {enrollments.map((enrollment) => (
          <AttendanceCard
            key={enrollment.id}
            enrollment={enrollment}
            onAttendanceChange={handleAttendanceChange}
            isUpdating={updatingEnrollmentId === enrollment.id}
          />
        ))}
      </div>

      {enrollments.length === 0 && (
        <div className="text-center py-8 text-stone-500">
          수강생이 없습니다.
        </div>
      )}
    </div>
  );
} 