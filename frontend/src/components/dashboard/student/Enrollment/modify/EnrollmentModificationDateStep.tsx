'use client'
import * as React from 'react'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { CalendarProvider } from '@/contexts/CalendarContext'
import DateSelectFooter from '@/components/features/student/enrollment/month/date/DateSelectFooter'
import { useState } from 'react'
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep'
import { useApp } from '@/contexts/AppContext'
import { useClassSessionsForModification } from '@/hooks/queries/student/useClassSessionsForModification'
import { useModificationErrorHandler } from '@/hooks/student/useModificationErrorHandler'
import { useEnrollmentModificationCalculation } from '@/hooks/useEnrollmentModificationCalculation'
import { ExtendedSessionData, EnrollmentModificationData } from '@/contexts/forms/EnrollmentFormManager'
import { toast } from 'sonner'
import type { ClassSessionForModification } from '@/types/api/class'
import type { ClassSession } from '@/types/api/class'
import type { EnrollmentModificationDateStepVM } from '@/types/view/student'

export function EnrollmentModificationDateStep({ 
  classId, 
  existingEnrollments, 
  month
}: EnrollmentModificationDateStepVM) {
  const { setSelectedSessions, setEnrollmentModificationStep, setEnrollmentModificationData } = useApp()
  
  // React Query 기반 데이터 관리
  const { data: modificationData, isLoading: isLoadingSessions, error: queryError } = useClassSessionsForModification(classId);
  
  // 에러 핸들러 훅 사용
  const { handleError, handleRetry } = useModificationErrorHandler({
    onRetry: () => {
      // React Query가 자동으로 재시도하므로 별도 처리 불필요
    }
  });

  const [selectedCount, setSelectedCount] = useState(0);
  const [_selectedClasses, setSelectedClasses] = useState<Array<{ id: number; sessions: ClassSessionForModification[] }>>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<number>>(new Set());
  
  // modificationData에서 세션 및 캘린더 범위 추출 (메모이제이션으로 무한 루프 방지)
  const modificationSessions = React.useMemo(() => {
    return modificationData?.sessions || [];
  }, [modificationData?.sessions]);
  
  // 세션 ID 배열을 메모이제이션하여 안정적인 의존성 생성
  const modificationSessionIds = React.useMemo(() => {
    return modificationSessions.map(s => s.id).join(',');
  }, [modificationSessions]);
  
  const calendarRange = React.useMemo(() => {
    return modificationData?.calendarRange ? {
      startDate: modificationData.calendarRange.startDate,
      endDate: modificationData.calendarRange.endDate,
    } : null;
  }, [modificationData?.calendarRange]);
  
  // 세션 데이터가 로드된 후 미리 선택 로직 실행 (한 번만 실행)
  const hasInitialized = React.useRef(false);
  React.useEffect(() => {
    if (modificationSessions.length > 0 && !hasInitialized.current) {
      const preSelectedSessionIds = new Set<number>();
      
      // 1. 기존 수강 신청 세션 미리 선택
      if (existingEnrollments && existingEnrollments.length > 0) {
        const activeEnrollmentDates = existingEnrollments
          .filter((enrollment) => {
            return enrollment.enrollment &&
              (enrollment.enrollment.status === "CONFIRMED" ||
                enrollment.enrollment.status === "PENDING" ||
                enrollment.enrollment.status === "REFUND_REJECTED_CONFIRMED");
          })
          .map((enrollment) => {
            return new Date(enrollment.date).toISOString().split("T")[0];
          });

        modificationSessions.forEach((session: ClassSessionForModification) => {
          const sessionDate = new Date(session.date).toISOString().split("T")[0];
          
          if (activeEnrollmentDates.includes(sessionDate)) {
            preSelectedSessionIds.add(session.id);
          }
        });
      }
      
      // 2. 취소 가능한 세션 미리 선택
      modificationSessions.forEach((session: ClassSessionForModification) => {
        if (session.canBeCancelled && !preSelectedSessionIds.has(session.id)) {
          preSelectedSessionIds.add(session.id);
        }
      });
      
      if (preSelectedSessionIds.size > 0) {
        setSelectedSessionIds(preSelectedSessionIds);
      }
      
      hasInitialized.current = true;
    }
  }, [modificationSessions, existingEnrollments]);

  // selectedClassCards는 더 이상 localStorage에 저장하지 않음 (Context 사용)
    
  const statusSteps = [
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '학원 선택',
      isActive: false,
      isCompleted: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps1.svg',
      label: '수강 변경',
      isActive: false,
      isCompleted: true, // 완료된 단계
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일자 선택',
      isActive: true,
      isCompleted: false,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '변경 확인',
      isActive: false,
      isCompleted: false,
    },
  ]



  // selectedSessionIds가 변경되면 selectedClasses 업데이트
  // selectedSessionIds의 size와 modificationSessionIds를 의존성으로 사용하여 무한 루프 방지
  const selectedSessionIdsSize = selectedSessionIds.size;
  
  React.useEffect(() => {
    const selectedSessions = modificationSessions.filter((session: ClassSessionForModification) => 
      selectedSessionIds.has(session.id)
    );
    
    const selectedClassInfo = {
      id: classId,
      sessions: selectedSessions,
    };
    
    setSelectedClasses([selectedClassInfo]);
    setSelectedCount(selectedSessions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionIdsSize, modificationSessionIds, classId]);

  // 수강 변경 계산 hook 사용
  const {
    netChangeCount,
    totalAmount,
    hasChanges,
    hasRealChanges,
    changeType,
    newlyAddedSessionsCount,
    newlyCancelledSessionsCount,
    newlyAddedSessionIds,
    newlyCancelledSessionIds,
    sessionPrice,
    nextStep,
  } = useEnrollmentModificationCalculation({
    existingEnrollments,
    selectedSessionIds,
    modificationSessions,
  });

  // 세션 선택 핸들러
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


  // 수강 변경 완료 처리 - EnrollmentContainer 패턴 적용
  const handleModificationComplete = () => {
    // netChange가 0이고 실제 변경이 없으면 처리하지 않음
    if (netChangeCount === 0 && !hasRealChanges) {
      toast.error('변경 사항이 없습니다.');
      return;
    }
    
    // 기존에 신청된 세션들 (활성 상태인 것만)
    const originalEnrolledSessions = existingEnrollments?.filter(
      (enrollment) => 
        enrollment.enrollment &&
        (enrollment.enrollment.status === "CONFIRMED" ||
          enrollment.enrollment.status === "PENDING" ||
          enrollment.enrollment.status === "REFUND_REJECTED_CONFIRMED")
    ) || [];

    // 선택된 세션 정보를 Context에 저장 (ExtendedSessionData 타입으로 변환)
    const selectedSessions = modificationSessions.filter(session => 
      selectedSessionIds.has(session.id)
    );
    
    const convertedSessions: ExtendedSessionData[] = selectedSessions.map(session => ({
      sessionId: session.id,
      sessionName: session.class?.className || 'Unknown Class',
      startTime: session.startTime,
      endTime: session.endTime,
      date: session.date,
      isAlreadyEnrolled: session.isAlreadyEnrolled || false,
      isEnrollable: session.isEnrollable || true,
      class: {
        id: session.class?.id || 0,
        className: session.class?.className || 'Unknown Class',
        level: session.class?.level || 'BEGINNER',
        tuitionFee: session.class?.tuitionFee || '0',
        teacher: {
          id: session.class?.teacher?.id || 0,
          name: session.class?.teacher?.name || 'Unknown Teacher',
        },
        academy: {
          id: 0,
          name: 'Unknown Academy',
        },
      },
    }));
    setSelectedSessions(convertedSessions);
    
    // Context에 수강 변경 데이터 저장
    const modData: EnrollmentModificationData = {
      changeType,
      changeAmount: Math.abs(totalAmount),
      netChangeCount,
      newSessionsCount: newlyAddedSessionsCount,
      cancelledSessionsCount: newlyCancelledSessionsCount,
      sessionPrice,
      selectedSessionIds: Array.from(selectedSessionIds),
      originalEnrollments: originalEnrolledSessions.map(session => ({
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        isAlreadyEnrolled: session.isAlreadyEnrolled,
        enrollment: session.enrollment ? {
          id: session.enrollment.id,
          status: session.enrollment.status,
          enrolledAt: session.enrollment.enrolledAt,
        } : undefined
      }))
    };
    
    // Context에 저장하고 다음 단계로 이동
    setEnrollmentModificationData({ modificationData: modData });
    setEnrollmentModificationStep(nextStep);
  }

  // 에러 처리 - 기본적인 패턴
  if (queryError && modificationSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">수강 변경 세션을 불러오는데 실패했습니다.</p>
        <button
          onClick={handleRetry}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
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
          수강 변경하실 세션을 선택해주세요.
        </div>
      </header>

      {/* Calendar Section */}
      <main className="flex-1 min-h-0 bg-white" style={{ height: 'calc(100vh - 220px)' }}>
        {isLoadingSessions ? (
          <div className="w-full flex flex-col items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
            <p className="mt-2 text-sm text-gray-600">수강 변경 정보를 불러오는 중...</p>
          </div>
        ) : (
          <div className="h-full">
            <CalendarProvider
              mode="modification"
              sessions={modificationSessions as unknown as ClassSession[]}
              selectedSessionIds={selectedSessionIds}
              onSessionSelect={handleSessionSelect}
              calendarRange={calendarRange ? {
                startDate: new Date(calendarRange.startDate),
                endDate: new Date(calendarRange.endDate)
              } : undefined}
            >
              <ConnectedCalendar />
            </CalendarProvider>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0">
        <DateSelectFooter 
          selectedCount={selectedCount}
          onGoToPayment={handleModificationComplete}
          mode="modification"
          netChange={netChangeCount}
          hasChanges={hasRealChanges}
          changeType={changeType}
        />
      </footer>
    </div>
  )
} 