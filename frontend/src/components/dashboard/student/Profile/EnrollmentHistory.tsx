'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, BookOpen, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { getEnrollmentHistory } from '@/api/student';

export function EnrollmentHistory() {
  const { pushFocus, popFocus } = useDashboardNavigation();
  const [enrollmentLogs, setEnrollmentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  useEffect(() => {
    pushFocus('subpage');
    return () => popFocus();
  }, [pushFocus, popFocus]);

  useEffect(() => {
    loadEnrollmentHistory();
  }, []);

  const loadEnrollmentHistory = async () => {
    try {
      setIsLoading(true);
      const response = await getEnrollmentHistory();
      console.log('Enrollment History Response:', response);
      setEnrollmentLogs(response);
    } catch (error) {
      console.error('Enrollment History Error:', error);
      toast.error('수강 내역을 불러오는데 실패했습니다.');
      setEnrollmentLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REFUND_REJECTED_CONFIRMED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'REFUND_REQUESTED':
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">대기중</Badge>;
      case 'CONFIRMED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">승인됨</Badge>;
      case 'REFUND_REJECTED_CONFIRMED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">환불거절</Badge>;
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
  const getEnrollmentStatus = (log: any): string => {
    return log.status;
  };

  // API 응답에서 클래스명 추출
  const getClassName = (log: any): string => {
    return log.session.class.className;
  };

  // API 응답에서 세션 날짜 추출
  const getSessionDate = (log: any): string => {
    return log.session.date;
  };

  // API 응답에서 세션 ID 추출
  const getSessionId = (log: any): number => {
    return log.id;
  };

  const filteredLogs = (enrollmentLogs || []).filter(log => {
    if (selectedFilter === 'ALL') return true;
    const status = getEnrollmentStatus(log);
    return status === selectedFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">수강 내역을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white max-w-[480px] mx-auto">
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 py-5 px-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">신청/결제 내역</h1>
          <p className="text-gray-600 mt-1">나의 수강 신청 및 결제 내역을 확인할 수 있습니다.</p>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-h-0 bg-white px-5 py-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              신청/결제 내역
            </CardTitle>
            <div className="flex gap-2 flex-wrap mt-3">
              <Button
                variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-7"
                onClick={() => setSelectedFilter('ALL')}
              >
                전체
              </Button>
              <Button
                variant={selectedFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-7"
                onClick={() => setSelectedFilter('PENDING')}
              >
                대기중
              </Button>
              <Button
                variant={selectedFilter === 'CONFIRMED' ? 'default' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-7"
                onClick={() => setSelectedFilter('CONFIRMED')}
              >
                승인됨
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
                variant={selectedFilter === 'REFUND_REJECTED_CONFIRMED' ? 'default' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-7"
                onClick={() => setSelectedFilter('REFUND_REJECTED_CONFIRMED')}
              >
                환불거절
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>신청/결제 내역이 없습니다.</p>
                <p className="text-sm">필터를 변경해보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => {
                  const status = getEnrollmentStatus(log);
                  const className = getClassName(log);
                  const sessionDate = getSessionDate(log);
                  const sessionId = getSessionId(log);
                  
                  return (
                    <Card key={log.id} className="hover:shadow-md transition-shadow">
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
                                <span>신청일: {formatDateTime(log.enrolledAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="text-sm text-gray-500">
                          <p>{log.description}</p>
                          
                          {/* 환불 요청 거절 사유 */}
                          {log.refundRejection && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="font-medium text-red-800">환불 요청 거절 사유</span>
                              </div>
                              <p className="text-red-700 mb-1">{log.refundRejection.reason}</p>
                              {log.refundRejection.detailedReason && (
                                <p className="text-red-600 text-xs">{log.refundRejection.detailedReason}</p>
                              )}
                              <p className="text-red-500 text-xs mt-1">
                                거절자: {log.refundRejection.rejector.name} | 
                                거절일: {formatDateTime(log.refundRejection.rejectedAt)}
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 