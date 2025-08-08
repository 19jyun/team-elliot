'use client'

import React, { useState, useEffect } from 'react'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { TeacherSessionCardList } from './TeacherSessionCardList'
import { TeacherClassDetail } from './TeacherClassDetail'
import { SessionEnrollmentList } from './SessionEnrollmentList'
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi'
import { ClassSession } from '@/types/api/class'

interface Session extends ClassSession {
  enrollmentCount: number
  confirmedCount: number
}

import { TeacherClassesWithSessionsResponse } from '@/types/api/teacher'

type ClassData = TeacherClassesWithSessionsResponse['classes'][0]

type TabType = 'sessions' | 'class-detail' | 'enrollments'

interface TeacherClassSessionModalProps {
  isOpen: boolean
  selectedClass: ClassData | null
  sessions?: any[]  // 부모에서 전달받은 세션 데이터
  onClose: () => void
}

export function TeacherClassSessionModal({ 
  isOpen, 
  selectedClass, 
  sessions: propSessions,
  onClose 
}: TeacherClassSessionModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sessions')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [sessionEnrollments, setSessionEnrollments] = useState<any[]>([])
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false)

  const { loadSessionEnrollments } = useTeacherApi()

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('sessions')
      setSelectedSession(null)
      setIsTransitioning(false)
      setSessionEnrollments([])
    }
  }, [isOpen])

  // 선택된 클래스의 세션만 필터링
  const filteredSessions = propSessions?.filter((session: any) => session.class.id === selectedClass?.id) || []

  // 선택된 세션의 수강생 목록 조회
  useEffect(() => {
    if (selectedSession?.id) {
      const fetchEnrollments = async () => {
        setIsLoadingEnrollments(true)
        const data = await loadSessionEnrollments(selectedSession.id)
        setSessionEnrollments(data?.enrollments || [])
        setIsLoadingEnrollments(false)
      }
      fetchEnrollments()
    }
  }, [selectedSession?.id, loadSessionEnrollments])

  if (!isOpen || !selectedClass) return null

  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab || isTransitioning) return

    setIsTransitioning(true)
    setActiveTab(newTab)

    // 애니메이션 완료 후 전환 상태 해제
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  const handleSessionClick = (session: any) => {
    setSelectedSession(session)
  }

  const navigationItems = [
    { label: '세션 목록', value: 'sessions' as TabType },
    { label: '클래스 정보', value: 'class-detail' as TabType },
  ]

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${selectedClass.className}`}
    >
      {/* Navigation Bar */}
      <div className="flex border-b border-gray-200 mb-4">
        {navigationItems.map((item) => (
          <button
            key={item.value}
            onClick={() => handleTabChange(item.value)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === item.value
                ? 'text-stone-700 border-b-2 border-stone-700'
                : 'text-stone-500 hover:text-stone-700'
            }`}
            disabled={isTransitioning}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="flex flex-col overflow-hidden" style={{ height: '600px' }}>
        <div 
          className={`flex transition-transform duration-300 ease-in-out ${
            isTransitioning ? 'pointer-events-none' : ''
          }`}
          style={{
            transform: activeTab === 'sessions' ? 'translateX(0)' : 'translateX(-50%)',
            width: '200%',
            height: '100%'
          }}
        >
          {/* Sessions Tab */}
          <div className="w-1/2 flex-shrink-0 px-1">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <TeacherSessionCardList
                sessions={filteredSessions}
                onSessionClick={handleSessionClick}
                isLoading={false}
              />
            </div>
          </div>

          {/* Class Detail Tab */}
          <div className="w-1/2 flex-shrink-0 px-1">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <TeacherClassDetail
                classId={selectedClass.id}
                classData={selectedClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments SlideUpModal (세션 클릭 시 표시) */}
      {selectedSession && (
        <SlideUpModal
          isOpen={!!selectedSession}
          onClose={() => {
            setSelectedSession(null)
            handleTabChange('sessions')
          }}
          title={`${selectedSession.class?.className || 'Unknown'} - ${new Date(selectedSession.date).toLocaleDateString()} 수강생 목록`}
        >
          <SessionEnrollmentList
            sessionEnrollments={sessionEnrollments}
            isLoading={isLoadingEnrollments}
            session={selectedSession as any}
          />
        </SlideUpModal>
      )}
    </SlideUpModal>
  )
} 