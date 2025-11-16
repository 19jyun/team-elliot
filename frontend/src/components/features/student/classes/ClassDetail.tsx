'use client';

import cn from 'classnames';
import { useApp } from '@/contexts/AppContext';
import { TeacherProfileCardForStudent } from '@/components/features/student/classes/TeacherProfileCardForStudent';
import { useClassDetails } from '@/hooks/queries/common/useClassDetails';
import type { StudentEnrolledSessionVM, ClassDetailVM, ClassDetailDisplayVM } from '@/types/view/student';
import { toClassDetailDisplayVM } from '@/lib/adapters/student';
import { formatTime } from '@/utils/dateTime';


export function ClassDetail({ classId, classSessions, showModificationButton = true, onModificationClick }: ClassDetailVM) {
  const { navigation } = useApp();
  const { navigateToSubPage } = navigation;
  
  // React Query 기반 데이터 관리
  const { data: classDetails, isLoading, error: queryError } = useClassDetails(classId);
  
  const error = queryError ? (queryError instanceof Error ? queryError.message : '클래스 정보를 불러오는데 실패했습니다.') : null;

  // View Model 생성
  const displayVM: ClassDetailDisplayVM = toClassDetailDisplayVM(
    classId,
    classDetails ?? null,
    isLoading,
    error,
    showModificationButton
  );

  const handleModificationRequest = () => {
    
    // 기존 수강 신청된 세션들의 월 정보를 분석
    let targetMonth = null;
    
    if (classSessions && classSessions.length > 0) {
      const enrolledSessions = classSessions.filter((session: StudentEnrolledSessionVM) => 
        session.enrollment_status === 'CONFIRMED' || 
        session.enrollment_status === 'PENDING' ||
        session.enrollment_status === 'REFUND_REJECTED_CONFIRMED'
      );
      
      
      if (enrolledSessions.length > 0) {
        const sessionDates = enrolledSessions.map((session: StudentEnrolledSessionVM) => new Date(session.date));
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
      const futureSessions = classSessions?.filter((session: StudentEnrolledSessionVM) => {
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

  if (displayVM.isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (displayVM.error || !classDetails) {
    return (
      <div className="flex items-center justify-center h-32 text-stone-500">
        {displayVM.error || '클래스 정보를 불러올 수 없습니다.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 수업 제목 */}
      <div className="text-[20px] font-semibold text-[#262626] leading-[130%]">
        {displayVM.className}
      </div>
      {/* 요일 및 시간 */}
      <div className="text-base text-[#262626]">
        {displayVM.dayOfWeek} {formatTime(displayVM.startTime)} - {formatTime(displayVM.endTime)}
      </div>
      {/* 구분선 */}
      <div className="border-b border-gray-200" />
      {/* 수업 설명 */}
      <div className="text-base text-[#262626] whitespace-pre-line">
        {displayVM.description}
      </div>
      
      {/* 선생님 프로필 카드 */}
      {displayVM.hasTeacher && displayVM.teacher && (
        <div className="mt-6">
          <TeacherProfileCardForStudent 
            teacherId={displayVM.teacher.id} 
          />
        </div>
      )}

      {/* 하단 고정 버튼 */}
      {displayVM.showModificationButton && (
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