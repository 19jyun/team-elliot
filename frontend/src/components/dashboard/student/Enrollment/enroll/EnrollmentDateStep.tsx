'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getStudentAvailableSessionsForEnrollment } from '@/api/class-sessions';
import { GetClassSessionsForEnrollmentResponse } from '@/types/api/class';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar';

export function EnrollmentDateStep() {
  const { enrollment, setEnrollmentStep, setSelectedSessions, goBack, navigateToSubPage } = useDashboardNavigation();
  const { selectedAcademyId, selectedClassIds } = enrollment;
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // 로그인 페이지로 리다이렉트는 상위에서 처리
    },
  });

  // SubPage 설정 - 이미 enroll 상태이므로 불필요
  // React.useEffect(() => {
  //   navigateToSubPage('enroll');
  // }, [navigateToSubPage]);

  const [selectedSessionIds, setSelectedSessionIds] = React.useState<Set<number>>(new Set());

  // 새로운 API를 사용하여 선택된 클래스들의 모든 세션 조회
  const { data: enrollmentData, isLoading } = useQuery({
    queryKey: ['studentAvailableSessionsForEnrollment', selectedAcademyId],
    queryFn: () => getStudentAvailableSessionsForEnrollment(selectedAcademyId!),
    enabled: selectedAcademyId !== null && status === 'authenticated',
  });

  // 선택된 클래스들의 세션만 필터링
  const selectedClassSessions = React.useMemo(() => {
    if (!enrollmentData?.sessions || !selectedClassIds.length) return [];
    
    const filteredSessions = enrollmentData.sessions.filter(session => 
      selectedClassIds.includes(session.classId)
    );
    

    
    return filteredSessions;
  }, [enrollmentData, selectedClassIds]);

  // 백엔드에서 받은 캘린더 범위 사용
  const calendarRange = React.useMemo(() => {
    if (!enrollmentData?.calendarRange) {
      // 백엔드에서 범위를 받지 못한 경우 기본값 사용
      return { startDate: new Date(), endDate: new Date() };
    }

    return {
      startDate: new Date(enrollmentData.calendarRange.startDate),
      endDate: new Date(enrollmentData.calendarRange.endDate),
    };
  }, [enrollmentData?.calendarRange]);

  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '학원 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '클래스 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '일자 선택',
      isActive: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '결제하기',
    },
  ];

  const handleSessionSelect = (sessionId: number) => {
    setSelectedSessionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleNextStep = () => {
    if (selectedSessionIds.size === 0) {
      toast.error('최소 1개 이상의 세션을 선택해주세요.');
      return;
    }
    
    // 선택된 세션들의 정보를 Context에 저장
    const selectedSessionsData = selectedClassSessions.filter(session => 
      selectedSessionIds.has(session.id)
    );
    
    setSelectedSessions(selectedSessionsData);
    setEnrollmentStep('payment');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (!selectedAcademyId || !selectedClassIds.length) {
    return (
      <div className="flex flex-col h-full bg-white">
        <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
          <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
            {statusSteps.map((step, index) => (
              <StatusStep key={index} {...step} />
            ))}
          </div>
          <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-red-600">
            클래스를 먼저 선택해주세요.
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">클래스가 선택되지 않았습니다</p>
            <p className="text-gray-600 mb-4">먼저 클래스를 선택해주세요</p>
            <button
              onClick={goBack}
              className="px-4 py-2 bg-[#AC9592] text-white rounded-lg hover:bg-[#8B7A77] transition-colors"
            >
              클래스 선택으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
        <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
          {statusSteps.map((step, index) => (
            <StatusStep key={index} {...step} />
          ))}
        </div>
        <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-zinc-600">
          수강하실 세션을 선택해주세요.
        </div>
      </header>

      {/* Calendar Section */}
      <main className="flex-1 min-h-0 bg-white" style={{ height: 'calc(100vh - 220px)' }}>
        {selectedClassSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">수강 가능한 세션이 없습니다</p>
              <p className="text-gray-600 mb-4">선택한 클래스에 해당하는 세션이 없습니다</p>
              <button
                onClick={goBack}
                className="px-4 py-2 bg-[#AC9592] text-white rounded-lg hover:bg-[#8B7A77] transition-colors"
              >
                클래스 선택으로 돌아가기
              </button>
            </div>
          </div>
                ) : (
          <div className="h-full">
            <CalendarProvider
              mode="enrollment"
              sessions={selectedClassSessions}
              selectedSessionIds={selectedSessionIds}
              onSessionSelect={handleSessionSelect}
              initialFocusedMonth={{
                year: calendarRange.startDate.getFullYear(),
                month: calendarRange.startDate.getMonth() + 1,
              }}
              calendarRange={calendarRange}
            >
              <ConnectedCalendar />
            </CalendarProvider>
          </div>
        )}
      </main>

      {/* Fixed Footer */}
      <footer className="flex-shrink-0 flex flex-col w-full bg-white border-t border-gray-200 min-h-[100px]">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
          <button
            className={`flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center ${selectedSessionIds.size > 0 ? 'bg-[#AC9592] text-white cursor-pointer' : 'bg-zinc-300 text-white cursor-not-allowed'}`}
            disabled={selectedSessionIds.size === 0}
            onClick={handleNextStep}
          >
            {selectedSessionIds.size > 0 ? (
              <span className="inline-flex items-center justify-center w-full">
                세션 선택 완료
                <span className="ml-2 bg-white text-[#AC9592] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold p-0 aspect-square">{selectedSessionIds.size}</span>
              </span>
            ) : (
              '세션을 1개 이상 선택 해 주세요'
            )}
          </button>
        </div>
      </footer>
    </div>
  );
} 