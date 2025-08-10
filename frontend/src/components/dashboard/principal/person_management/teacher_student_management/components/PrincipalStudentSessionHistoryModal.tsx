'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi';
import { format } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { SlideUpModal } from '@/components/common/SlideUpModal';

interface PrincipalStudentSessionHistoryModalProps {
  student: any;
  onClose: () => void;
}

export function PrincipalStudentSessionHistoryModal({ student, onClose }: PrincipalStudentSessionHistoryModalProps) {
  const [history, setHistory] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getStudentSessionHistory } = usePrincipalApi();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await getStudentSessionHistory(Number(student.id));
        setHistory(response);
      } catch (error: any) {
        toast.error(error.response?.data?.message || '수강생 현황 조회에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [student.id]);

  // 날짜 포맷 함수
  function formatDate(dateStr?: string) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return format(date, 'yyyy.MM.dd');
  }

  // 수강 상태 아이콘 함수
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'ATTENDED':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'ABSENT':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REFUND_REQUESTED':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'REFUND_REJECTED_CONFIRMED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'REFUND_CANCELLED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'TEACHER_CANCELLED':
        return <XCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

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
      isOpen={!!history}
      onClose={onClose}
      title={`${student.name}님의 수강 현황`}
      contentClassName="pb-6"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 text-center py-4">
          이 수강생의 모든 수강 기록을 확인할 수 있습니다.
        </p>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <p>수강 현황을 불러오는 중...</p>
          </div>
        ) : (
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
                {history?.map((session: any) => (
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
        )}
      </div>
    </SlideUpModal>
  );
} 