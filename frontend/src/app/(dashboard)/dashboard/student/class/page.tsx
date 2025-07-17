'use client'

import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { getMyClasses } from '@/api/student'
import { EnrolledClassesList } from '@/components/features/student/classes/EnrolledClassesList'
import { ClassSessionModal } from '@/components/features/student/classes/ClassSessionModal'
import { DateSessionModal } from '@/components/calendar/DateSessionModal'
import { StudentSessionDetailModal } from '@/components/features/student/classes/StudentSessionDetailModal'
import { CalendarProvider } from '@/contexts/CalendarContext'
import { ConnectedCalendar } from '@/components/calendar/ConnectedCalendar'
import { ClassSession } from '@/types/api/class'

// Type for extended session
type ExtendedSession = {
  accessToken?: string
  user: {
    id: string
    role: string
    accessToken?: string
  } & { name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined }
}

export default function StudentDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })


  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  
  // 날짜 클릭 관련 상태 추가
  const [clickedDate, setClickedDate] = useState<Date | null>(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [selectedDaySessions, setSelectedDaySessions] = useState<any[]>([])
  
  // 세션 상세 모달 상태 추가
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)

  const { data: myClasses, isLoading, error } = useQuery({
    queryKey: ['my-classes'],
    queryFn: getMyClasses,
    enabled: status === 'authenticated' && !!session?.user && !!session?.accessToken,
    retry: false,
  })

  // ConnectedCalendar용 데이터 변환
  const convertedSessions = useMemo(() => {
    if (!myClasses?.sessionClasses) return [];
    
    return myClasses.sessionClasses.map((session: any) => ({
      id: session.id,
      classId: session.classId || session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      currentStudents: session.currentStudents || 0,
      maxStudents: session.maxStudents || 0,
      isEnrollable: false, // student-view에서는 선택 불가
      isFull: session.currentStudents >= session.maxStudents,
      isPastStartTime: new Date(session.date + ' ' + session.startTime) < new Date(),
      isAlreadyEnrolled: true, // 이미 수강 중인 세션
      studentEnrollmentStatus: 'CONFIRMED',
      class: {
        id: session.class?.id || session.classId || session.id,
        className: session.class?.className || '클래스',
        level: session.class?.level || 'BEGINNER',
        tuitionFee: session.class?.tuitionFee?.toString() || '50000',
        teacher: {
          id: session.class?.teacher?.id || 0,
          name: session.class?.teacher?.name || '선생님',
        },
      },
    })) as ClassSession[];
  }, [myClasses?.sessionClasses]);

  // 백엔드에서 받은 캘린더 범위 사용
  const calendarRange = useMemo(() => {
    if (!myClasses?.calendarRange) {
      // 백엔드에서 범위를 받지 못한 경우 기본값 사용
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
      };
    }

    return {
      startDate: new Date(myClasses.calendarRange.startDate),
      endDate: new Date(myClasses.calendarRange.endDate),
    };
  }, [myClasses?.calendarRange]);

  // myClasses 객체 로그 출력
  console.log('myClasses:', myClasses)

  // 로딩 상태 처리
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 에러 처리
  if (error) {
    if ((error as any)?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/login' });
      return null;
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    )
  }



  const handleClassClick = (classData: any) => {
    setSelectedClass(classData)
    setIsSessionModalOpen(true)
  }

  const closeSessionModal = () => {
    setIsSessionModalOpen(false)
    setSelectedClass(null)
  }

  // 날짜 클릭 핸들러 추가 (ConnectedCalendar용)
  const handleDateClick = (date: string) => {
    const clickedDateObj = new Date(date)
    
    // 해당 날짜의 세션들 필터링 (로컬 시간대로 비교)
    const daySessions = convertedSessions.filter((session) => {
      const sessionDate = new Date(session.date)
      const sessionYear = sessionDate.getFullYear();
      const sessionMonth = String(sessionDate.getMonth() + 1).padStart(2, '0');
      const sessionDay = String(sessionDate.getDate()).padStart(2, '0');
      const sessionDateString = `${sessionYear}-${sessionMonth}-${sessionDay}`;
      return sessionDateString === date;
    })

    setClickedDate(clickedDateObj)
    setSelectedDaySessions(daySessions)
    setIsDateModalOpen(true)
  }

  const closeDateModal = () => {
    setIsDateModalOpen(false)
    setClickedDate(null)
    setSelectedDaySessions([])
  }

  // 세션 클릭 핸들러 추가
  const handleSessionClick = (session: any) => {
    setSelectedSession(session)
    setIsSessionDetailModalOpen(true)
    setIsDateModalOpen(false) // 날짜 모달 닫기
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0">
        {/* 환영 메시지 + 캘린더 */}
        <div className="flex flex-col px-5 py-6">
          <h1 className="text-2xl font-bold text-stone-700">
            안녕하세요, {session?.user?.name}님!
          </h1>
          <p className="mt-2 text-stone-500">오늘도 즐거운 학습되세요!</p>
        </div>

        {/* 캘린더 섹션 */}
        <div className="flex flex-col w-full bg-white text-stone-700" style={{ height: 'calc(100vh - 450px)' }}>
          <CalendarProvider
            mode="student-view"
            sessions={convertedSessions}
            selectedSessionIds={new Set()}
            onSessionSelect={() => {}} // student-view에서는 선택 기능 없음
            onDateClick={handleDateClick}
            calendarRange={calendarRange}
          >
            <ConnectedCalendar />
          </CalendarProvider>
        </div>
      </header>
      
      <main className="flex-1 min-h-0 bg-white px-5">
                <div className="gap-2.5 self-start px-2 py-3 text-base font-semibold tracking-normal leading-snug text-stone-700 flex-shrink-0 ">
          수강중인 클래스
        </div>
        <div className="w-full overflow-auto" style={{ 
          maxHeight: '150px',  // 최대 높이만 설정
        }}>
          {/* 수강중인 클래스 리스트 */}
          <div className="flex flex-col mt-4 w-full h-full">
            <EnrolledClassesList
              classes={myClasses?.enrollmentClasses || []}
              onClassClick={handleClassClick}
            />
          </div>
        </div>
      </main>

      {/* Class Session Modal */}
      <ClassSessionModal
        isOpen={isSessionModalOpen}
        selectedClass={selectedClass}
        sessions={myClasses?.sessionClasses || []}
        onClose={closeSessionModal}
      />

      {/* Date Session Modal */}
      <DateSessionModal
        isOpen={isDateModalOpen}
        selectedDate={clickedDate}
        sessions={selectedDaySessions}
        onClose={closeDateModal}
        onSessionClick={handleSessionClick}
        userRole="student"
      />

      {/* Student Session Detail Modal */}
      <StudentSessionDetailModal
        isOpen={isSessionDetailModalOpen}
        session={selectedSession}
        onClose={closeSessionDetailModal}
      />


    </div>
  )
}
