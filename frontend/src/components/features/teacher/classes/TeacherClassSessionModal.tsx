'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { TeacherSessionCardList } from './TeacherSessionCardList'
import { TeacherClassDetail } from './TeacherClassDetail'
import { SessionEnrollmentList } from './SessionEnrollmentList'
import { getSessionEnrollments } from '@/api/index'
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

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('sessions')
      setSelectedSession(null)
      setIsTransitioning(false)
    }
  }, [isOpen])

  // 선택된 클래스의 세션만 필터링
  const filteredSessions = propSessions?.filter((session: any) => session.class.id === selectedClass?.id) || []
  console.log("filteredSessions", filteredSessions)
  console.log("selectedClass", selectedClass)

  // 선택된 세션의 수강생 목록 조회
  const { data: sessionEnrollmentsResponse, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['session-enrollments', selectedSession?.id],
    queryFn: () => getSessionEnrollments(selectedSession?.id || 0),
    enabled: isOpen && !!selectedSession?.id,
  })

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
    handleTabChange('enrollments')
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
      <div className="relative overflow-hidden">
        <div 
          className={`flex transition-transform duration-300 ease-in-out ${
            isTransitioning ? 'pointer-events-none' : ''
          }`}
          style={{
            transform: activeTab === 'sessions' ? 'translateX(0)' : 'translateX(-50%)',
            width: '200%'
          }}
        >
          {/* Sessions Tab */}
          <div className="w-1/2 flex-shrink-0">
            <TeacherSessionCardList
              sessions={filteredSessions}
              onSessionClick={handleSessionClick}
              isLoading={false}
            />
          </div>

          {/* Class Detail Tab */}
          <div className="w-1/2 flex-shrink-0">
            <TeacherClassDetail
              classId={selectedClass.id}
              classData={selectedClass}
            />
          </div>
        </div>
      </div>

      {/* Enrollments Modal (세션 클릭 시 표시) */}
      {selectedSession && activeTab === 'enrollments' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedSession.class?.className || 'Unknown'} - {new Date(selectedSession.date).toLocaleDateString()} 수강생 목록
              </h3>
              <button
                onClick={() => {
                  setSelectedSession(null)
                  handleTabChange('sessions')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <SessionEnrollmentList
                sessionEnrollments={(sessionEnrollmentsResponse?.enrollments as any) || []}
                isLoading={enrollmentsLoading}
                session={selectedSession as any}
              />
            </div>
          </div>
        </div>
      )}
    </SlideUpModal>
  )
} 