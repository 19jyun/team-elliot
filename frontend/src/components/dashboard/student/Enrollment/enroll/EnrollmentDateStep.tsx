'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { ExtendedSessionData } from '@/contexts/forms/EnrollmentFormManager';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar';
import { useStudentApi } from '@/hooks/student/useStudentApi';

export function EnrollmentDateStep() {
  const { form, goBack, setEnrollmentStep, setSelectedSessions } = useApp();
  const { enrollment } = form;
  const { selectedAcademyId, selectedClassIds } = enrollment;
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // 로그인 페이지로 리다이렉트는 상위에서 처리
    },
  });

  // API에서 수강 가능한 세션 데이터 가져오기
  const { availableSessions, isLoading, error, loadAvailableClasses, clearErrors } = useStudentApi();

  const [selectedSessionIds, setSelectedSessionIds] = React.useState<Set<number>>(new Set());

  // 선택된 학원이 변경될 때 수강 가능한 세션 로드
  React.useEffect(() => {
    if (selectedAcademyId) {
      loadAvailableClasses(selectedAcademyId);
    }
  }, [selectedAcademyId, loadAvailableClasses]);

  // 선택된 클래스들의 세션만 필터링하고 ClassSession 형식으로 변환
  const selectedClassSessions = React.useMemo(() => {
    if (!availableSessions || !selectedClassIds.length) return [];
    

    
    const filteredSessions = availableSessions.filter(session => 
      selectedClassIds.includes(session.classId)
    );
    

    
    // AvailableSession을 ClassSession 형식으로 변환
    const result = filteredSessions.map(session => ({
      id: session.id,
      classId: session.classId,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      maxStudents: session.maxStudents,
      currentStudents: session.currentStudents,
      isEnrollable: session.isEnrollable,
      isFull: session.isFull,
      isPastStartTime: session.isPastStartTime,
      isAlreadyEnrolled: session.isAlreadyEnrolled,
      studentEnrollmentStatus: null, // 수강신청 단계에서는 아직 수강신청하지 않은 상태
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      class: {
        id: session.class.id,
        className: session.class.className,
        level: session.class.level,
        tuitionFee: session.class.tuitionFee.toString(), // number를 string으로 변환
        teacher: session.class.teacher,
        academy: session.class.academy,
      },
    }));
    

    

    
    return result;
  }, [availableSessions, selectedClassIds]);

  // 캘린더 범위 계산
  const calendarRange = React.useMemo(() => {
    if (!selectedClassSessions.length) {
      // 세션이 없는 경우 기본값 사용
      return { startDate: new Date(), endDate: new Date() };
    }

    // 선택된 세션들의 날짜 범위 계산
    const dates = selectedClassSessions.map(session => new Date(session.date));
    const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return { startDate, endDate };
  }, [selectedClassSessions]);

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
    const selectedSessionsData: ExtendedSessionData[] = selectedClassSessions
      .filter(session => selectedSessionIds.has(session.id))
      .map(session => ({
        sessionId: session.id,
        sessionName: session.class.className,
        startTime: session.startTime,
        endTime: session.endTime,
        date: session.date,
        isAlreadyEnrolled: session.isAlreadyEnrolled,
        isEnrollable: session.isEnrollable,
        class: session.class,
      }));
    
    setSelectedSessions(selectedSessionsData);
    setEnrollmentStep('payment');
  };

  // 에러 처리 - AcademyManagement와 동일한 패턴 적용
  if (error && (!availableSessions || availableSessions.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">세션 정보를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => {
            clearErrors();
            loadAvailableClasses(selectedAcademyId || undefined);
          }}
          className="mt-4 px-4 py-2 bg-[#AC9592] text-white rounded-lg hover:bg-[#8B7A77] transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

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