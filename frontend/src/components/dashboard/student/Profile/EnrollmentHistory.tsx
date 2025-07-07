'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, BookOpen, CheckCircle, XCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { activityLogApi } from '@/api/activityLog';
import { EnrollmentHistoryItem } from '@/types/api/activityLog';

export function EnrollmentHistory() {
  const { pushFocus, popFocus } = useDashboardNavigation();
  const [enrollmentLogs, setEnrollmentLogs] = useState<EnrollmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  useEffect(() => {
    // 컴포넌트가 마운트될 때 포커스를 subpage로 설정
    pushFocus('subpage');
    
    return () => {
      // 컴포넌트가 언마운트될 때 이전 포커스로 복원
      popFocus();
    };
  }, [pushFocus, popFocus]);

  useEffect(() => {
    loadEnrollmentHistory();
  }, []);

  const loadEnrollmentHistory = async () => {
    try {
      setIsLoading(true);
      console.log('수강 내역 API 호출 시작...');
      
      const response = await activityLogApi.getEnrollmentHistory({
        page: 1,
        limit: 50, // 충분한 데이터를 가져오기 위해 50개로 설정
      });
      
      console.log('API 응답:', response);
      
      // axios 응답 구조: response.data에 실제 데이터가 있음
      if (response && response.data && response.data.logs) {
        console.log('수강 내역 로드 성공:', response.data.logs.length, '개');
        setEnrollmentLogs(response.data.logs);
      } else {
        console.warn('API 응답에 logs가 없습니다:', response);
        setEnrollmentLogs([]);
      }
    } catch (error) {
      console.error('수강 내역 로드 실패:', error);
      console.error('에러 상세 정보:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
      });
      toast.error('수강 내역을 불러오는데 실패했습니다.');
      setEnrollmentLogs([]); // 에러 시 빈 배열로 설정
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
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'ATTENDED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ABSENT':
        return <XCircle className="w-4 h-4 text-red-500" />;
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
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">취소됨</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">완료</Badge>;
      case 'ATTENDED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">출석</Badge>;
      case 'ABSENT':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">결석</Badge>;
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
  const getEnrollmentStatus = (log: EnrollmentHistoryItem): string => {
    try {
      if (log.newValue) {
        const parsedValue = typeof log.newValue === 'string' ? JSON.parse(log.newValue) : log.newValue;
        if (parsedValue.status) {
          return parsedValue.status;
        }
      }
    } catch (error) {
      console.warn('newValue 파싱 실패:', error);
    }
    
    // action에 따라 상태 추정
    switch (log.action) {
      case 'ENROLL_SESSION':
        return 'PENDING';
      case 'CANCEL_ENROLLMENT':
        return 'CANCELLED';
      case 'APPROVE_ENROLLMENT':
        return 'CONFIRMED';
      case 'REJECT_ENROLLMENT':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  };

  // API 응답에서 클래스명 추출
  const getClassName = (log: EnrollmentHistoryItem): string => {
    try {
      if (log.newValue) {
        const parsedValue = typeof log.newValue === 'string' ? JSON.parse(log.newValue) : log.newValue;
        if (parsedValue.className) {
          return parsedValue.className;
        }
        if (parsedValue.sessionName) {
          return parsedValue.sessionName;
        }
      }
    } catch (error) {
      console.warn('newValue 파싱 실패:', error);
    }
    
    return log.description || '수강 신청';
  };

  // API 응답에서 세션 날짜 추출
  const getSessionDate = (log: EnrollmentHistoryItem): string => {
    try {
      if (log.newValue) {
        const parsedValue = typeof log.newValue === 'string' ? JSON.parse(log.newValue) : log.newValue;
        if (parsedValue.sessionDate) {
          return parsedValue.sessionDate;
        }
        if (parsedValue.enrolledAt) {
          return parsedValue.enrolledAt;
        }
      }
    } catch (error) {
      console.warn('newValue 파싱 실패:', error);
    }
    
    return log.createdAt;
  };

  // API 응답에서 세션 ID 추출
  const getSessionId = (log: EnrollmentHistoryItem): number => {
    try {
      if (log.newValue) {
        const parsedValue = typeof log.newValue === 'string' ? JSON.parse(log.newValue) : log.newValue;
        if (parsedValue.sessionId) {
          return parsedValue.sessionId;
        }
      }
    } catch (error) {
      console.warn('newValue 파싱 실패:', error);
    }
    
    if (log.entityId) {
      return log.entityId;
    }
    
    return 0;
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
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full h-full bg-white max-w-[480px] py-5 relative">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">신청/결제 내역</h1>
          <p className="text-gray-600 mt-1">나의 수강 신청 및 결제 내역을 확인할 수 있습니다.</p>
        </div>
      </div>

      <Separator className="mx-5" />

      {/* 수강 내역 목록 */}
      <div className="px-5 pb-6 flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              수강 내역
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
                variant={selectedFilter === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-7"
                onClick={() => setSelectedFilter('COMPLETED')}
              >
                완료
              </Button>
              <Button
                variant={selectedFilter === 'CANCELLED' ? 'default' : 'outline'}
                size="sm"
                className="text-xs px-2 py-1 h-7"
                onClick={() => setSelectedFilter('CANCELLED')}
              >
                취소됨
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>수강 내역이 없습니다.</p>
                <p className="text-sm">필터를 변경해보세요.</p>
              </div>
            ) : (
              <div className="space-y-4 h-full overflow-y-auto">
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>수업일: {formatDate(sessionDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>신청일: {formatDateTime(log.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>세션 ID: {sessionId}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="text-sm text-gray-500">
                          <p>{log.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 