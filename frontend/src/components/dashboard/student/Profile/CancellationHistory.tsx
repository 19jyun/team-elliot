'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, BookOpen, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon, DollarSign } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useStudentData } from '@/hooks/redux/useStudentData';
import { toStudentCancellationHistoryVMs } from '@/lib/adapters/student';
import type { StudentCancellationHistoryVM } from '@/types/view/student';

export function CancellationHistory() {
  const { ui } = useApp();
  const { pushFocus, popFocus } = ui;
  const { cancellationHistory, isLoading, error } = useStudentData();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // API 응답을 뷰모델로 변환
  const cancellationHistoryVMs: StudentCancellationHistoryVM[] = toStudentCancellationHistoryVMs(cancellationHistory);

  useEffect(() => {
    pushFocus('subpage');
    return () => popFocus();
  }, [pushFocus, popFocus]);

  // 에러 처리
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">환불/취소 내역을 불러오는데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REFUND_REQUESTED':
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">환불거절</Badge>;
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">환불완료</Badge>;
      case 'REFUND_REQUESTED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">환불대기</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // API 응답에서 상태 정보 추출
  const getCancellationStatus = (log: StudentCancellationHistoryVM): string => {
    return log.status;
  };

  // API 응답에서 클래스명 추출
  const getClassName = (log: StudentCancellationHistoryVM): string => {
    return log.className;
  };

  // API 응답에서 세션 날짜 추출
  const getSessionDate = (log: StudentCancellationHistoryVM): string => {
    return log.sessionDate;
  };

  // API 응답에서 세션 ID 추출
  const getSessionId = (log: StudentCancellationHistoryVM): number => {
    return log.sessionId ?? 0;
  };

  // API 응답에서 환불 금액 추출
  const getRefundAmount = (log: StudentCancellationHistoryVM): string => {
    if (typeof log.refundAmount === 'number') {
      return `${log.refundAmount.toLocaleString()}원`;
    }
    return '금액 정보 없음';
  };

  // 신청/처리 일시 추출 (백엔드 평면 필드 호환)
  const getAppliedAt = (log: StudentCancellationHistoryVM): string | undefined => {
    return log.requestedAt;
  };

  // 설명/사유 추출 (백엔드 평면 필드 호환)
  const getDescription = (log: StudentCancellationHistoryVM): string => {
    return log.reason || '';
  };

  const filteredLogs = cancellationHistoryVMs.filter(log => {
    if (selectedFilter === 'ALL') return true;
    const status = getCancellationStatus(log);
    return status === selectedFilter;
  });

  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto">
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 py-5 px-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">환불/취소 내역</h1>
          <p className="text-gray-600 mt-1">나의 환불 요청 및 취소 내역을 확인할 수 있습니다.</p>
        </div>
        
        {/* 필터 버튼들 */}
        <div className="flex gap-2 flex-wrap mt-4">
          <Button
            variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-2 py-1 h-7"
            onClick={() => setSelectedFilter('ALL')}
          >
            전체
          </Button>
          <Button
            variant={selectedFilter === 'REFUND_REQUESTED' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-2 py-1 h-7"
            onClick={() => setSelectedFilter('REFUND_REQUESTED')}
          >
            환불대기
          </Button>
          <Button
            variant={selectedFilter === 'APPROVED' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-2 py-1 h-7"
            onClick={() => setSelectedFilter('APPROVED')}
          >
            환불완료
          </Button>
          <Button
            variant={selectedFilter === 'REJECTED' ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-2 py-1 h-7"
            onClick={() => setSelectedFilter('REJECTED')}
          >
            환불거절
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-0 bg-white px-5 py-4">
        <div className="h-full overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>환불/취소 내역이 없습니다.</p>
                <p className="text-sm">필터를 변경해보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => {
                  const status = getCancellationStatus(log);
                  const className = getClassName(log);
                  const sessionDate = getSessionDate(log);
                  const sessionId = getSessionId(log);
                  const refundAmount = getRefundAmount(log);
                  const appliedAt = getAppliedAt(log);
                  
                  return (
                    <Card 
                      key={log.id} 
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {getStatusIcon(status)}
                              <h3 className="text-lg font-semibold text-gray-900">
                                {className}
                              </h3>
                              {getStatusBadge(status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>수업일: {formatDate(sessionDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>신청일: {appliedAt ? formatDateTime(appliedAt) : '-'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>세션 ID: {sessionId}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>환불금액: {refundAmount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="text-sm text-gray-500">
                          <p>{getDescription(log)}</p>
                          
                          {/* 환불 요청 거절 사유 */}
                          {log.rejectionDetail && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="font-medium text-red-800">환불 요청 거절 사유</span>
                              </div>
                              <p className="text-red-700 mb-1">{log.rejectionDetail.reason}</p>
                              {log.rejectionDetail.detailedReason && (
                                <p className="text-red-600 text-xs">{log.rejectionDetail.detailedReason}</p>
                              )}
                              <p className="text-red-500 text-xs mt-1">
                                거절자: {log.rejectionDetail.rejector.name} | 
                                거절일: {formatDateTime(log.rejectionDetail.rejectedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        </div>
      </main>
    </div>
  );
} 