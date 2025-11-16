'use client';

import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

import { SlideUpModal } from '@/components/common/SlideUpModal';
import { usePrincipalStudentSessionHistory } from '@/hooks/queries/principal/usePrincipalStudentSessionHistory';
import { toPrincipalStudentSessionHistoryModalVM } from '@/lib/adapters/principal';
import type { PrincipalStudentSessionHistoryItem } from '@/types/view/principal';

interface PrincipalStudentSessionHistoryModalProps {
  student: { id: number; name: string };
  onClose: () => void;
}

export function PrincipalStudentSessionHistoryModal({ student, onClose }: PrincipalStudentSessionHistoryModalProps) {
  // React Query 기반 데이터 관리
  const { data: historyData, isLoading, error } = usePrincipalStudentSessionHistory(student.id);
  
  // SessionEnrollment[]를 PrincipalStudentSessionHistoryItem[]로 변환
  // 백엔드 응답 구조: SessionEnrollment { id, status, enrolledAt, session: { date, startTime, endTime, class: { id, className, teacher } } }
  const history = useMemo(() => {
    if (!historyData || !Array.isArray(historyData)) return [];
    
    return historyData.map((enrollment: any) => {
      // SessionEnrollment 구조에서 데이터 추출
      const session = enrollment.session || {};
      const classData = session.class || {};
      
      return {
        id: enrollment.id,
        session: {
          date: session.date, // session.date는 DateTime 객체
          class: {
            className: classData.className || classData.name || '알 수 없음',
          },
        },
        status: enrollment.status || 'UNKNOWN',
        enrolledAt: enrollment.enrolledAt, // enrolledAt은 DateTime 객체
      };
    }) as PrincipalStudentSessionHistoryItem[];
  }, [historyData]);

  // ViewModel 생성
  const historyModalVM = useMemo(() => toPrincipalStudentSessionHistoryModalVM({
    student,
    history,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  }), [student, history, isLoading, error]);

  // 날짜 포맷 함수
  function formatDate(dateStr?: string) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return format(date, 'yyyy.MM.dd');
  }



  // 수강 상태 Badge 함수
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">대기중</Badge>;
      case 'CONFIRMED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">승인됨</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">취소됨</Badge>;
      case 'ATTENDED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">출석</Badge>;
      case 'ABSENT':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">결석</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">완료</Badge>;
      case 'REFUND_REQUESTED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">환불대기</Badge>;
      case 'REFUND_REJECTED_CONFIRMED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">환불거절</Badge>;
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">거절됨</Badge>;
      case 'REFUND_CANCELLED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">환불완료</Badge>;
      case 'TEACHER_CANCELLED':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">선생님취소</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <SlideUpModal
      isOpen={true}
      onClose={onClose}
      title={`${historyModalVM.student.name}님의 수강 현황`}
      contentClassName="pb-6"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 text-center py-4">
          이 수강생의 모든 수강 기록을 확인할 수 있습니다.
        </p>

        {historyModalVM.isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <p>수강 현황을 불러오는 중...</p>
          </div>
        ) : historyModalVM.hasHistory ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    강의명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수강일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수강 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyModalVM.history.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {session.session.class.className}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.session.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.enrolledAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{historyModalVM.emptyMessage}</p>
          </div>
        )}
      </div>
    </SlideUpModal>
  );
} 