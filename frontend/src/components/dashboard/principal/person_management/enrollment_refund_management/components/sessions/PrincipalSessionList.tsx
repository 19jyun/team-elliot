'use client';

import React from 'react';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';

import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { toPrincipalSessionListForRequestsVM } from '@/lib/adapters/principal';
import type { PrincipalEnrollment } from '@/types/api/principal';
import type { PrincipalSessionListForRequestsVM } from '@/types/view/principal';

export function PrincipalSessionList() {
  const { 
    personManagement,
    setSelectedSessionId, 
    setPersonManagementStep
  } = usePrincipalContext();
  const { selectedTab, selectedClassId } = personManagement;

  // Redux store에서 데이터 가져오기
  const { 
    enrollments,
    refundRequests,
    isLoading, 
    error 
  } = usePrincipalData();

  // ViewModel 생성
  const sessionListVM: PrincipalSessionListForRequestsVM = toPrincipalSessionListForRequestsVM({
    enrollments: (enrollments as unknown as PrincipalEnrollment[]) || [],
    refundRequests: refundRequests || [],
    selectedTab,
    selectedClassId,
    isLoading,
    error,
  });

  const handleSessionClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setPersonManagementStep('request-detail');
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') {
      return '날짜 없음';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '날짜 없음';
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch {
      return '날짜 없음';
    }
  };


  const getLevelColor = (level: string) => {
    const levelColors: Record<string, string> = {
      'BEGINNER': '#F4E7E7',
      'INTERMEDIATE': '#FBF4D8',
      'ADVANCED': '#CBDFE3',
    };
    return levelColors[level] || '#F4E7E7';
  };


  if (sessionListVM.isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (sessionListVM.error) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (sessionListVM.showClassSelectionMessage) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">클래스를 선택해주세요.</p>
      </div>
    );
  }

  if (!sessionListVM.hasSessions) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-center">
          <p className="text-stone-500 mb-4">
            {sessionListVM.emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {/* 세션 목록 */}
      <div className="space-y-3">
        {sessionListVM.sessions.map((session) => (
          <div
            key={session.sessionId}
            className="cursor-pointer hover:shadow-md transition-shadow border border-stone-200 rounded-lg p-4"
            style={{ background: getLevelColor(session.level) }}
            onClick={() => handleSessionClick(session.sessionId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-stone-500" />
                <span className="font-medium text-stone-700">
                  {formatDate(session.date)}
                </span>
              </div>
              <Badge variant="secondary" className="bg-stone-100 text-stone-800">
                {session.pendingCount}건 대기
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 