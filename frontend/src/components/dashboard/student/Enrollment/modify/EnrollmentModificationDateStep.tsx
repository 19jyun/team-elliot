'use client'
import * as React from 'react'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { CalendarProvider } from '@/contexts/CalendarContext'
import DateSelectFooter from '@/components/features/student/enrollment/month/date/DateSelectFooter'
import { useState } from 'react'
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep'
import { useImprovedApp } from '@/contexts/ImprovedAppContext'
import { useEnrollmentCalculation } from '@/hooks/useEnrollmentCalculation'
import { useStudentApi } from '@/hooks/student/useStudentApi'
import type { ClassSessionForModification } from '@/types/api/class'
import type { ClassSession } from '@/types/api/class'
import type { EnrollmentModificationDateStepVM } from '@/types/view/student'

export function EnrollmentModificationDateStep({ 
  classId, 
  existingEnrollments, 
  onComplete 
}: EnrollmentModificationDateStepVM) {
  const { setSelectedSessions } = useImprovedApp()
  const { loadModificationSessions } = useStudentApi();
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedClasses, setSelectedClasses] = useState<Array<{ id: number; sessions: ClassSessionForModification[] }>>([]);
  const [modificationSessions, setModificationSessions] = useState<ClassSessionForModification[]>([]);
  const [calendarRange, setCalendarRange] = useState<{startDate: string, endDate: string} | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<number>>(new Set());
  
  // 수강 변경용 세션 데이터 로드
  React.useEffect(() => {
    const loadSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const response = await loadModificationSessions(classId);
        
        if (response) {
          setModificationSessions(response.sessions);
          setCalendarRange(response.calendarRange);
        }
        
        // 세션 데이터가 로드된 후 미리 선택 로직 실행
        if (response) {
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

            response.sessions.forEach((session: ClassSessionForModification) => {
              const sessionDate = new Date(session.date).toISOString().split("T")[0];
              
              if (activeEnrollmentDates.includes(sessionDate)) {
                preSelectedSessionIds.add(session.id);
              }
            });
          }
          
          // 2. 취소 가능한 세션 미리 선택
          response.sessions.forEach((session: ClassSessionForModification) => {
            if (session.canBeCancelled && !preSelectedSessionIds.has(session.id)) {
              preSelectedSessionIds.add(session.id);
            }
          });
          
          setSelectedSessionIds(preSelectedSessionIds);
        }
      } catch (error) {
        console.error('수강 변경용 세션 데이터 로드 실패:', error);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    loadSessions();
  }, [classId, loadModificationSessions]); // existingEnrollments 의존성 제거

  // existingEnrollments가 변경될 때 미리 선택 로직 재실행
  React.useEffect(() => {
    if (modificationSessions.length > 0 && existingEnrollments && existingEnrollments.length > 0) {
      const preSelectedSessionIds = new Set<number>();
      
      // 기존 수강 신청 세션 미리 선택
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
      
      // 취소 가능한 세션도 미리 선택
      modificationSessions.forEach((session: ClassSessionForModification) => {
        if (session.canBeCancelled && !preSelectedSessionIds.has(session.id)) {
          preSelectedSessionIds.add(session.id);
        }
      });
      
      setSelectedSessionIds(preSelectedSessionIds);
    }
  }, [existingEnrollments, modificationSessions]);

  React.useEffect(() => {
    const selectedClassCards = [{
      id: classId,
    }];
    localStorage.setItem('selectedClassCards', JSON.stringify(selectedClassCards));
  }, [classId]);
    
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
  React.useEffect(() => {
    const selectedSessions = modificationSessions.filter(session => 
      selectedSessionIds.has(session.id)
    );
    
    const selectedClassInfo = {
      id: classId,
      sessions: selectedSessions,
    };
    
    setSelectedClasses([selectedClassInfo]);
    setSelectedCount(selectedSessions.length);
  }, [selectedSessionIds, modificationSessions, classId]);

  // 변경된 강의 개수 계산 및 변경 사항 여부 확인 (간단한 계산만)
  const { netChangeCount, hasChanges } = React.useMemo(() => {
    if (!existingEnrollments) {
      return { netChangeCount: 0, hasChanges: false };
    }
    
    // 기존에 신청된 세션들 (백엔드에서 계산된 isAlreadyEnrolled 사용)
    const originalEnrolledSessions = existingEnrollments.filter(
      (enrollment) => enrollment.isAlreadyEnrolled === true
    );

    // 기존 수강 세션의 ID들
    const originalSessionIds = new Set(originalEnrolledSessions.map(session => session.id));

    // 새로 추가될 세션 수 (기존에 없던 세션들)
    const newlyAddedSessionsCount = Array.from(selectedSessionIds).filter(
      sessionId => !originalSessionIds.has(sessionId)
    ).length;

    // 새로 취소될 세션 수 (기존에 있던 세션들)
    const newlyCancelledSessionsCount = Array.from(originalSessionIds).filter(
      sessionId => !selectedSessionIds.has(sessionId)
    ).length;

    // 순 변경 세션 수 = 새로 추가 - 새로 취소
    const netChange = newlyAddedSessionsCount - newlyCancelledSessionsCount;
    
    // 실제 변경 사항이 있는지 확인
    const hasChanges = newlyAddedSessionsCount > 0 || newlyCancelledSessionsCount > 0;
    
    return { netChangeCount: netChange, hasChanges };
  }, [existingEnrollments, selectedSessionIds]);

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


  // 수강 변경 완료 처리
  const handleModificationComplete = () => {
    if (typeof window !== 'undefined') {
      // 선택된 세션 정보 저장
      const selectedSessions = modificationSessions.filter(session => 
        selectedSessionIds.has(session.id)
      );
      
      // 기존 수강 신청 정보도 저장 (Payment Step에서 비교용)
      if (existingEnrollments) {
        localStorage.setItem('existingEnrollments', JSON.stringify(existingEnrollments));
      }
      
      // 선택된 세션 정보도 저장 (환불 시 필요할 수 있음)
      localStorage.setItem('selectedSessions', JSON.stringify(selectedSessions));
      localStorage.setItem('selectedClasses', JSON.stringify([{
        id: classId,
        sessions: selectedSessions
      }]));
      
      // Context에도 저장 (SessionData 타입으로 변환)
      const convertedSessions = selectedSessions.map(session => ({
        sessionId: session.id,
        sessionName: session.class?.className || 'Unknown Class',
        startTime: session.startTime,
        endTime: session.endTime,
        date: session.date,
      }));
      setSelectedSessions(convertedSessions);
      
      // 실제 수강료 계산
      const actualSessionPrice = modificationSessions.length > 0 
        ? parseInt(modificationSessions[0].class?.tuitionFee || '50000')
        : 50000;
      
      // onComplete 콜백 호출 (세션 ID와 수강료 정보 전달)
      onComplete(selectedSessionIds, actualSessionPrice);
    }
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
          hasChanges={hasChanges}
        />
      </footer>
    </div>
  )
} 