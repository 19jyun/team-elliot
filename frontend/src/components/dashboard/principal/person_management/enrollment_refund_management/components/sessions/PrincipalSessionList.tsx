'use client';

import React from 'react';
import { usePrincipalContext } from '@/contexts/PrincipalContext';
import { usePrincipalData } from '@/hooks/redux/usePrincipalData';

import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

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

  // 선택된 탭에 따라 원본 데이터 결정
  const rawData = selectedTab === 'enrollment' 
    ? enrollments 
    : refundRequests;

  // 선택된 클래스의 세션만 필터링하고 세션별로 그룹화
  const sessionMap = new Map();
  
  if (selectedTab === 'enrollment') {
    // 수강신청 데이터 처리
    const pendingEnrollments = rawData?.filter((enrollment: any) => {
      const classId = enrollment.session?.class?.id;
      return enrollment.status === "PENDING" && classId === selectedClassId;
    });
    
    pendingEnrollments?.forEach((enrollment: any) => {
      const sessionId = enrollment.sessionId;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          sessionId,
          className: enrollment.session?.class?.className || "클래스명 없음",
          date: enrollment.session?.date || "",
          startTime: enrollment.session?.startTime || "",
          endTime: enrollment.session?.endTime || "",
          level: "BEGINNER",
          teacherName: enrollment.session?.class?.teacher?.name || "미지정",
          currentStudents: 0,
          maxStudents: 0,
          pendingCount: 0,
          enrollments: [],
        });
      }
      const session = sessionMap.get(sessionId);
      if (session) {
        session.pendingCount++;
        session.enrollments.push(enrollment);
      }
    });
  } else {
    // 환불신청 데이터 처리
    const pendingRefunds = rawData?.filter((refund: any) => {
      const classId = refund.sessionEnrollment?.session?.class?.id;
      return refund.status === "PENDING" && classId === selectedClassId;
    });
    
    pendingRefunds?.forEach((refund: any) => {
      const sessionId = refund.sessionEnrollment?.session?.id;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          sessionId,
          className: refund.sessionEnrollment?.session?.class?.className || "클래스명 없음",
          date: refund.sessionEnrollment?.session?.date || "",
          startTime: refund.sessionEnrollment?.session?.startTime || "",
          endTime: refund.sessionEnrollment?.session?.endTime || "",
          level: "BEGINNER",
          teacherName: refund.sessionEnrollment?.session?.class?.teacher?.name || "미지정",
          currentStudents: 0,
          maxStudents: 0,
          pendingCount: 0,
          refundRequests: [],
        });
      }
      const session = sessionMap.get(sessionId);
      if (session) {
        session.pendingCount++;
        session.refundRequests.push(refund);
      }
    });
  }

  const sessions = Array.from(sessionMap.values());

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

  if (!selectedClassId) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-stone-500">클래스를 선택해주세요.</p>
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
      {/* 세션 목록 */}
      <div className="space-y-3">
        {sessions.map((session: any) => (
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