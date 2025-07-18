'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getStudentAvailableSessionsForEnrollment } from '@/api/class-sessions';
import { GetClassSessionsForEnrollmentResponse } from '@/types/api/class';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import { ClassCard } from '@/components/features/student/enrollment/month/ClassCard';
import { ClassDetailModal } from '@/components/features/student/classes/ClassDetailModal';
import { RefundPolicy } from '@/components/features/student/enrollment/RefundPolicy';
import { useState } from 'react';

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const daysKor = ['월', '화', '수', '목', '금', '토', '일'];
const timeSlots = [
  '9', '10', '11', '12', '13', '14', '15', '16', 
  '17', '18', '19', '20', '21', '22', '23',
];

function formatTime(date: string | Date) {
  const d = new Date(date);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatTimeForCalendar(date: string | Date) {
  const d = new Date(date);
  const h = d.getHours().toString();
  return h;
}

export function EnrollmentClassStep() {
  const { enrollment, setEnrollmentStep, setSelectedClassIds, goBack, navigateToSubPage } = useDashboardNavigation();
  const { selectedAcademyId } = enrollment;
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
    },
  });

    // SubPage 설정 - 이미 enroll 상태이므로 불필요
  // React.useEffect(() => {
  //   navigateToSubPage('enroll');
  // }, [navigateToSubPage]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showClassDetailModal, setShowClassDetailModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [showPolicy, setShowPolicy] = useState(true);

  // 새로운 API를 사용하여 학원 내 모든 클래스와 세션 조회
  const { data: enrollmentData, isLoading } = useQuery({
    queryKey: ['studentAvailableSessionsForEnrollment', selectedAcademyId],
    queryFn: () => getStudentAvailableSessionsForEnrollment(selectedAcademyId!),
    enabled: selectedAcademyId !== null && status === 'authenticated',
  });

  // 클래스별로 그룹핑하고 타임테이블 형식으로 변환
  const classesWithSessions = React.useMemo(() => {
    if (!enrollmentData?.sessions) return [];

    const classMap = new Map();
    enrollmentData.sessions.forEach(session => {
      if (session.class && !classMap.has(session.class.id)) {
        // 각 세션의 시간 정보를 사용하여 클래스 정보 구성
        const sessionDate = new Date(session.date);
        const dayOfWeek = days[sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1]; // 일요일을 7번째로 변환
        
        classMap.set(session.class.id, {
          id: session.class.id,
          className: session.class.className,
          level: session.class.level,
          tuitionFee: session.class.tuitionFee,
          teacher: session.class.teacher,
          dayOfWeek: dayOfWeek,
          startTime: session.startTime,
          endTime: session.endTime,
          backgroundColor: (session.class as any).backgroundColor,
          sessionCount: enrollmentData.sessions.filter(s => s.classId === session.class?.id).length,
        });
      }
    });

    return Array.from(classMap.values());
  }, [enrollmentData]);

  // localStorage 확인하여 이전에 동의했다면 정책 건너뛰기
  // selectedAcademyId가 변경될 때마다 다시 확인 (다른 학원을 선택했을 때)
  React.useEffect(() => {
    const hasAgreed = localStorage.getItem('refundPolicyAgreed') === 'true';
    if (hasAgreed) {
      setShowPolicy(false);
    } else {
      setShowPolicy(true);
    }
  }, [selectedAcademyId]);

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
      isActive: true,
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '일자 선택',
    },
    {
      icon: '/icons/CourseRegistrationsStatusSteps2.svg',
      label: '결제하기',
    },
  ];

  const handleClassInfoClick = (classId: number) => {
    setSelectedClassId(classId);
    setShowClassDetailModal(true);
  };

  const handleSelect = (id: number) => {
    // 이미 선택된 클래스라면 선택 해제
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
      return;
    }

    // 선택하려는 클래스의 요일 확인
    const targetClass = classesWithSessions.find((classInfo: any) => classInfo.id === id);
    if (!targetClass) return;

    const targetDayOfWeek = targetClass.dayOfWeek;

    // 이미 선택된 클래스들 중 같은 요일이 있는지 확인
    const hasSameDayClass = selectedIds.some(selectedId => {
      const selectedClass = classesWithSessions.find((classInfo: any) => classInfo.id === selectedId);
      return selectedClass?.dayOfWeek === targetDayOfWeek;
    });

    if (hasSameDayClass) {
      toast.error('동일 요일 클래스는 동시에 수강신청을 진행할 수 없어요! 만일 2개이상의 클래스를 신청하고 싶으시면, 수강신청을 다시 반복해주셔야 해요!');
      return;
    }

    // 같은 요일이 없으면 선택 추가
    setSelectedIds(prev => [...prev, id]);
  };

  const handleNextStep = () => {
    if (selectedIds.length === 0) {
      toast.error('최소 1개 이상의 클래스를 선택해주세요.');
      return;
    }
    
    setSelectedClassIds(selectedIds);
    setEnrollmentStep('date-selection');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  if (!selectedAcademyId) {
    return (
      <div className="flex flex-col h-full bg-white">
        <header className="flex-shrink-0 flex flex-col bg-white border-b border-gray-200 py-5 min-h-[120px] relative">
          <div className="flex gap-10 self-center w-full text-sm font-medium tracking-normal leading-snug max-w-[297px] mt-2 mb-2">
            {statusSteps.map((step, index) => (
              <StatusStep key={index} {...step} />
            ))}
          </div>
          <div className="self-center pb-4 text-base font-medium tracking-normal leading-snug text-center text-red-600">
            학원을 먼저 선택해주세요.
          </div>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">학원이 선택되지 않았습니다</p>
            <p className="text-gray-600 mb-4">먼저 학원을 선택해주세요</p>
            <button
              onClick={goBack}
              className="px-4 py-2 bg-[#AC9592] text-white rounded-lg hover:bg-[#8B7A77] transition-colors"
            >
              학원 선택으로 돌아가기
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
          수강하실 클래스를 모두 선택해주세요.
        </div>
      </header>

      {/* Scrollable Timetable Section */}
      <main className="flex-1 min-h-0 bg-white px-5">
        {/* Timetable Container with Scroll */}
        <div className="w-full overflow-auto" style={{ 
          height: 'calc(100vh - 400px)',
          minHeight: 0 
        }}>
          {/* Sticky Header Row */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="grid" style={{ gridTemplateColumns: `40px repeat(7, 80px)`, minWidth: '600px' }}>
              <div className="h-10 bg-white" />
              {daysKor.map(day => (
                <div key={day} className="h-10 flex items-center justify-center font-semibold text-sm text-gray-900">{day}</div>
              ))}
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="grid relative" style={{
            gridTemplateColumns: `40px repeat(7, 80px)`,
            gridTemplateRows: `repeat(${timeSlots.length}, 110px)`,
            minWidth: '600px',
            width: '100%',
            height: `${timeSlots.length * 110}px`
          }}>
            {/* 시간 표시 */}
            {timeSlots.map((time, rowIdx) => (
              <div
                key={time}
                className="sticky left-0 z-20 flex items-start justify-start text-sm text-gray-400 border-r border-gray-200 bg-white pt-1 pl-2"
                style={{ gridRow: rowIdx + 1, gridColumn: 1 }}
              >
                {time}
              </div>
            ))}

            {/* 빈 Grid cell들 (배경용) */}
            {timeSlots.map((time, rowIdx) => (
              days.map((day, colIdx) => {
                const cellKey = `${day}-${time}`;
                return (
                  <div
                    key={cellKey}
                    className="relative border-b border-r border-gray-100"
                    style={{ gridRow: rowIdx + 1, gridColumn: colIdx + 2 }}
                  />
                );
              })
            ))}

            {/* ClassCard들을 Grid와 같은 레벨에 배치 */}
            {classesWithSessions?.map((classInfo: any) => {
              const startDate = new Date(classInfo.startTime);
              const endDate = new Date(classInfo.endTime);
              const startHour = startDate.getHours();
              const durationInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
              const durationInHours = durationInMinutes / 60;
              const gridRowSpan = Math.ceil(durationInHours);
              const actualHeight = durationInHours * 110;
              
              // Grid 위치 계산
              const dayIndex = days.indexOf(classInfo.dayOfWeek);
              const timeIndex = timeSlots.indexOf(startHour.toString());
              const gridRow = timeIndex + 1;
              const gridColumn = dayIndex + 2; // 1은 시간 열이므로 +2
              
              return (
                <ClassCard
                  key={classInfo.id}
                  {...classInfo}
                  className={classInfo.className}
                  teacher={classInfo.teacher?.name || '선생님'}
                  startTime={formatTime(classInfo.startTime)}
                  endTime={formatTime(classInfo.endTime)}
                  dayIndex={days.indexOf(classInfo.dayOfWeek)}
                  startHour={Number(formatTimeForCalendar(classInfo.startTime))}
                  bgColor={classInfo.backgroundColor ? `bg-${classInfo.backgroundColor}` : 'bg-gray-100'}
                  selected={selectedIds.includes(classInfo.id)}
                  onClick={() => handleSelect(classInfo.id)}
                  onInfoClick={() => handleClassInfoClick(classInfo.id)}
                  containerWidth="100%"
                  style={{ 
                    position: 'absolute',
                    gridRow: `${gridRow} / span ${gridRowSpan}`,
                    gridColumn: gridColumn,
                    height: `${actualHeight}px`,
                    maxHeight: `${actualHeight}px`,
                    width: '72px',
                    left: '4px',
                    right: '4px'
                  }}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="flex-shrink-0 flex flex-col w-full bg-white border-t border-gray-200 min-h-[100px]">
        <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
          <button
            className={`flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center ${selectedIds.length > 0 ? 'bg-[#AC9592] text-white cursor-pointer' : 'bg-zinc-300 text-white cursor-not-allowed'}`}
            disabled={selectedIds.length === 0}
            onClick={handleNextStep}
          >
            {selectedIds.length > 0 ? (
              <span className="inline-flex items-center justify-center w-full">
                클래스 선택 완료
                <span className="ml-2 bg-white text-[#AC9592] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold p-0 aspect-square">{selectedIds.length}</span>
              </span>
            ) : (
              '클래스를 1개 이상 선택 해 주세요'
            )}
          </button>
        </div>
      </footer>

      {/* RefundPolicy Modal - 절대 위치로 위에 배치 */}
      <div className={`absolute inset-0 z-50 ${showPolicy ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <RefundPolicy 
          isOpen={showPolicy}
          onClose={() => {
            // 상태 업데이트를 안전하게 처리
            requestAnimationFrame(() => {
              setShowPolicy(false);
            });
          }} 
        />
      </div>

      {/* ClassDetailModal */}
      {selectedClassId && (
        <ClassDetailModal
          isOpen={showClassDetailModal}
          onClose={() => {
            setShowClassDetailModal(false);
            setSelectedClassId(null);
          }}
          classId={selectedClassId}
        />
      )}
    </div>
  );
} 