'use client';

import React from 'react';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { usePrincipalData } from '@/hooks/usePrincipalData';
import { parseFromUTCISO } from '@/lib/timeUtils';

export function PrincipalSessionList() {
  const { 
    personManagement, 
    setSelectedSessionId, 
    setPersonManagementStep
  } = usePrincipalContext();
  const { selectedTab } = personManagement;

  // Redux store에서 데이터 가져오기
  const { 
    pendingEnrollmentSessions, 
    pendingRefundSessions, 
    isLoading, 
    error 
  } = usePrincipalData();

  // 선택된 탭에 따라 세션 목록 결정
  const sessions = selectedTab === 'enrollment' 
    ? pendingEnrollmentSessions 
    : pendingRefundSessions;

  const handleSessionClick = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setPersonManagementStep('enrollment-refund');
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
    } catch (error) {
      return '날짜 없음';
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'Invalid Date') {
      return '시간 없음';
    }
    try {
      // UTC ISO 문자열을 한국 시간으로 변환
      const koreanTime = parseFromUTCISO(timeString);
      if (isNaN(koreanTime.getTime())) {
        return '시간 없음';
      }
      return koreanTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      return '시간 없음';
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
            key={session.sessionId}
            className="bg-white rounded-lg border border-stone-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSessionClick(session.sessionId)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">
                  {session.className || '클래스명 없음'}
                </h3>
                <p className="text-sm text-stone-600">
                  {formatDate(session.date)} {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{ backgroundColor: getLevelColor(session.level) }}
                >
                  {getLevelText(session.level)}
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full font-medium">
                  {session.pendingCount}건 대기
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-stone-500">
              <span>강사: {session.teacherName || '미지정'}</span>
              <span>수강생: {session.currentStudents || 0}명</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 