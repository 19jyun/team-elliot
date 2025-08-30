'use client';

import { useState, useEffect } from 'react';

// 역할 분리: 학생 화면에서 필요 시 별도 학생용 API로 대체 또는 서버 컴포넌트에서 주입
import { ClassDetailsResponse } from '@/types/api/class';
import { toast } from 'sonner';
import cn from 'classnames';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { TeacherProfileCard } from '@/components/common/TeacherProfileCard';
import { useStudentApi } from '@/hooks/student/useStudentApi';

interface ClassDetailProps {
  classId: number;
  classSessions?: any[];
  showModificationButton?: boolean;
  onModificationClick?: () => void;
}

export function ClassDetail({ classId, classSessions, showModificationButton = true, onModificationClick }: ClassDetailProps) {
  const [classDetails, setClassDetails] = useState<ClassDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { navigateToSubPage } = useDashboardNavigation();
  const { getClassDetails } = useStudentApi();

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    }
  }, [classId]);

  // teacher 정보 디버깅
  useEffect(() => {
    if (classDetails?.teacher) {
    }
  }, [classDetails?.teacher]);

  const loadClassDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getClassDetails(classId);
      setClassDetails(response || null);
    } catch (error) {
      console.error('클래스 상세 정보 로드 실패:', error);
      toast.error('클래스 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string | Date) => {
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDayOfWeek = (dayOfWeek: string) => {
    const dayMap: Record<string, string> = {
      'MONDAY': '월요일',
      'TUESDAY': '화요일',
      'WEDNESDAY': '수요일',
      'THURSDAY': '목요일',
      'FRIDAY': '금요일',
      'SATURDAY': '토요일',
      'SUNDAY': '일요일',
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  const handleModificationRequest = () => {
    
    // 기존 수강 신청된 세션들의 월 정보를 분석
    let targetMonth = null;
    
    if (classSessions && classSessions.length > 0) {
      const enrolledSessions = classSessions.filter((session: any) => 
        session.enrollment_status === 'CONFIRMED' || 
        session.enrollment_status === 'PENDING' ||
        session.enrollment_status === 'REFUND_REJECTED_CONFIRMED'
      );
      
      
      if (enrolledSessions.length > 0) {
        const sessionDates = enrolledSessions.map((session: any) => new Date(session.date));
        const months = sessionDates.map(date => date.getMonth() + 1); // 0-based index
        const uniqueMonths = [...new Set(months)];
        
        
        // 가장 많은 세션이 있는 월을 targetMonth로 설정
        const monthCounts = uniqueMonths.map(month => ({
          month,
          count: months.filter(m => m === month).length
        }));
        const mostFrequentMonth = monthCounts.reduce((prev, current) => 
          prev.count > current.count ? prev : current
        );
        
        targetMonth = mostFrequentMonth.month;
      }
    }
    
    // 기존 수강 신청이 없는 경우 가장 가까운 미래 세션의 월을 우선 선택
    if (!targetMonth) {
      const currentDate = new Date();
      const futureSessions = classSessions?.filter((session: any) => {
        const sessionDate = new Date(session.date);
        return sessionDate > currentDate;
      }) || [];
      
      if (futureSessions.length > 0) {
        // 가장 가까운 미래 세션의 월을 선택
        const closestSession = futureSessions.reduce((closest, current) => {
          const closestDate = new Date(closest.date);
          const currentDate = new Date(current.date);
          return currentDate < closestDate ? current : closest;
        });
        
        targetMonth = new Date(closestSession.date).getMonth() + 1;
      } else {
        // 미래 세션이 없으면 현재 월 사용
        targetMonth = currentDate.getMonth() + 1;
      }
    }
    
    // 수강 변경 SubPage로 이동 (월 정보 포함)
    const subPagePath = `modify-${classId}-${targetMonth}`;
    
    // 모달 닫기 콜백 호출
    if (onModificationClick) {
      onModificationClick();
    }
    
    navigateToSubPage(subPagePath);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="flex items-center justify-center h-32 text-stone-500">
        클래스 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 수업 제목 */}
      <div className="text-[20px] font-semibold text-[#262626] leading-[130%]">
        {classDetails?.className}
      </div>
      {/* 요일 및 시간 */}
      <div className="text-base text-[#262626]">
        {formatDayOfWeek(classDetails?.dayOfWeek ?? '')} {formatTime(classDetails?.startTime ?? '')} - {formatTime(classDetails?.endTime ?? '')}
      </div>
      {/* 구분선 */}
      <div className="border-b border-gray-200" />
      {/* 수업 설명 */}
      <div className="text-base text-[#262626] whitespace-pre-line">
        {classDetails?.classDetail?.description || classDetails?.description || '클래스 설명이 없습니다.'}
      </div>
      
      {/* 선생님 프로필 카드 */}
      {classDetails?.teacher && (
        <div className="mt-6">
          <TeacherProfileCard 
            teacherId={classDetails.teacherId} 
            isEditable={false}
            showHeader={false}
            compact={true}
          />
        </div>
      )}

      {/* 하단 고정 버튼 */}
      {showModificationButton && (
        <div className="mt-6">
          <button
            onClick={handleModificationRequest}
            className={cn(
              'w-full px-2.5 py-4 rounded-lg text-base font-semibold leading-snug text-white',
              'bg-[#AC9592] hover:bg-[#8c7a74] transition-colors',
            )}
          >
            수강 변경/취소
          </button>
        </div>
      )}
    </div>
  );
} 