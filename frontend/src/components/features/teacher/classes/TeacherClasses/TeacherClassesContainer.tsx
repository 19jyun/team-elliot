'use client'

import { useSession, useSignOut } from '@/lib/auth/AuthProvider'
import { useState, useEffect } from 'react'

import { ClassList } from '@/components/common/ClassContainer/ClassList'
import { ClassSessionModal } from '@/components/common/ClassContainer/ClassSessionModal'
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi'
import { toTeacherClassListVM, toTeacherClassSessionModalVM } from '@/lib/adapters/teacher'
import type { TeacherClassListVM, TeacherClassSessionModalVM, TeacherClassCardVM } from '@/types/view/teacher'
import { Class } from '@/types/api/class'
import { DayOfWeek } from '@/types/api/common'

// TeacherClassCardVM을 Class 타입으로 변환하는 함수
function toClassFromTeacherClassCardVM(classCardVM: TeacherClassCardVM): Class {
  return {
    id: classCardVM.id,
    className: classCardVM.className,
    classCode: '', // TeacherClassCardVM에는 없으므로 기본값
    description: classCardVM.description || '', // TeacherClassCardVM에는 없으므로 기본값
    maxStudents: classCardVM.maxStudents,
    currentStudents: classCardVM.currentStudents,
    tuitionFee: classCardVM.tuitionFee,
    teacherId: 0, // TeacherClassCardVM에는 없으므로 기본값
    academyId: 0, // TeacherClassCardVM에는 없으므로 기본값
    dayOfWeek: classCardVM.dayOfWeek as DayOfWeek,
    startTime: classCardVM.startTime,
    endTime: classCardVM.endTime,
    level: classCardVM.level,
    status: 'ACTIVE', // 기본값
    startDate: '', // TeacherClassCardVM에는 없으므로 기본값
    endDate: '', // TeacherClassCardVM에는 없으므로 기본값
    backgroundColor: '#f3f4f6', // 기본값
    teacher: { id: 0, name: '', photoUrl: '' }, // 기본값
    academy: { id: 0, name: '' }, // 기본값
  };
}

export function TeacherClassesContainer() {
  const { status } = useSession()
  const signOut = useSignOut()

  const [selectedClass, setSelectedClass] = useState<TeacherClassCardVM | null>(null)
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)

  // API 기반 데이터 관리
  const { classes: myClasses, loadClasses, isLoading, error } = useTeacherApi()

  // ViewModel 변환
  const errorMessage = error && typeof error === 'object' && 'message' in error 
    ? (error as { message: string }).message 
    : typeof error === 'string' ? error : null;
  const classListVM: TeacherClassListVM = toTeacherClassListVM(myClasses, isLoading, errorMessage);
  
  // 클래스 세션 모달 ViewModel
  const classSessionModalVM: TeacherClassSessionModalVM = toTeacherClassSessionModalVM({
    isOpen: isSessionModalOpen,
    selectedClass: selectedClass,
    onClose: () => setIsSessionModalOpen(false)
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // 로딩 상태 처리
  if (status === 'loading' || classListVM.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  // 에러 처리
  if (classListVM.error) {
    const errorResponse = error as { response?: { status?: number } }
    if (errorResponse?.response?.status === 401) {
      signOut({ redirect: true, callbackUrl: '/' });
      return null;
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-red-500">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={() => loadClasses()}
          className="mt-4 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800"
        >
          다시 시도
        </button>
      </div>
    )
  }

  const handleClassClick = (classData: TeacherClassCardVM) => {
    setSelectedClass(classData)
    setIsSessionModalOpen(true)
  }


  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex-shrink-0">
        <div className="flex flex-col px-5 py-6">
          <h1 className="text-2xl font-bold text-stone-700">
            내 담당 클래스
          </h1>
          <p className="mt-2 text-stone-500">
            담당하고 있는 클래스들을 확인하세요.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ClassList
          classes={myClasses}
          onClassClick={(classData) => {
            const classCardVM = classListVM.classes.find(c => c.id === classData.id);
            if (classCardVM) handleClassClick(classCardVM);
          }}
          role="teacher"
        />
      </main>

      {classSessionModalVM.selectedClass && (
        <ClassSessionModal
          isOpen={classSessionModalVM.isOpen}
          selectedClass={toClassFromTeacherClassCardVM(classSessionModalVM.selectedClass)}
          onClose={classSessionModalVM.onClose}
          role="teacher"
        />
      )}
    </div>
  )
} 