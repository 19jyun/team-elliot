'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { getPrincipalSessionsWithPendingRequests } from '@/api/principal';
import { parseFromUTCISO } from '@/lib/timeUtils';

export function PrincipalSessionList() {
  const { 
    personManagement, 
    setSelectedSessionId, 
    setPersonManagementStep
  } = usePrincipalContext();
  const { selectedTab } = personManagement;

  // Principal의 세션별 요청 목록 조회
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['principal-sessions-requests', selectedTab],
    queryFn: () => getPrincipalSessionsWithPendingRequests(selectedTab),
  });

  const handleSessionClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setPersonManagementStep('enrollment-refund');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString: string) => {
    // UTC ISO 문자열을 한국 시간으로 변환
    const koreanTime = parseFromUTCISO(timeString);
    return koreanTime.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getLevelColor = (level: string) => {
    const levelColors: Record<string, string> = {
      'BEGINNER': '#F4E7E7',
      'INTERMEDIATE': '#FBF4D8',
      'ADVANCED': '#CBDFE3',
    };
    return levelColors[level] || '#F4E7E7';
  };

  const getLevelText = (level: string) => {
    const levelTexts: Record<string, string> = {
      'BEGINNER': '초급',
      'INTERMEDIATE': '중급',
      'ADVANCED': '고급',
    };
    return levelTexts[level] || '초급';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-center">
          <p className="text-stone-500 mb-4">
            {selectedTab === 'enrollment' 
              ? '수강 신청이 대기 중인 세션이 없습니다.'
              : '환불 요청이 대기 중인 세션이 없습니다.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="space-y-3">
        {sessions.map((session: any) => (
          <div
            key={session.id}
            onClick={() => handleSessionClick(session.id)}
            className="p-4 border border-stone-200 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200"
            style={{ background: getLevelColor(session.class?.level || 'BEGINNER') }}
          >
            {/* 헤더: 클래스명과 요청 수 */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 text-xs font-medium text-white rounded"
                  style={{
                    background: 'var(--Primary-Dark, linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), #573B30)',
                  }}
                >
                  {getLevelText(session.class?.level || 'BEGINNER')}
                </span>
                <h3 className="font-semibold text-stone-700">{session.className}</h3>
              </div>
              <span className="px-2 py-1 text-xs bg-primary text-white rounded-full font-medium">
                {session.requestCount}개 요청
              </span>
            </div>

            {/* 날짜 정보 */}
            <div className="mb-2">
              <p className="text-sm font-medium text-stone-700">
                {formatDate(session.sessionDate)}
              </p>
            </div>

            {/* 시간 정보 */}
            <div className="mb-3">
              <p className="text-sm text-stone-600">
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSessionClick(session.id);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                요청 보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 