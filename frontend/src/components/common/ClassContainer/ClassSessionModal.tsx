'use client'

import React, { useState, useEffect } from 'react'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { SessionCardList } from '@/components/common/Session/SessionCardList'
import { ClassDetail } from './ClassDetail'
import { SessionDetailModal } from '@/components/common/Session/SessionDetailModal'
import { ClassSession } from '@/types/api/class'

interface Session extends ClassSession {
  enrollmentCount: number
  confirmedCount: number
}

type TabType = 'sessions' | 'class-detail'

interface ClassSessionModalProps {
  isOpen: boolean
  selectedClass: any
  sessions?: any[]
  onClose: () => void
  role: 'teacher' | 'principal'
}

export function ClassSessionModal({ 
  isOpen, 
  selectedClass, 
  sessions: propSessions,
  onClose,
  role
}: ClassSessionModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sessions')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isSessionDetailModalOpen, setIsSessionDetailModalOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('sessions')
      setSelectedSession(null)
      setIsSessionDetailModalOpen(false)
      setIsTransitioning(false)
    }
  }, [isOpen])

  // 선택된 클래스의 세션만 필터링
  const filteredSessions = propSessions?.filter((session: any) => {
    // session.class가 없거나 session.class.id가 없는 경우 안전하게 처리
    if (!session?.class?.id || !selectedClass?.id) {
      return false
    }
    return session.class.id === selectedClass.id
  }) || []

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
    setIsSessionDetailModalOpen(true)
  }

  const closeSessionDetailModal = () => {
    setIsSessionDetailModalOpen(false)
    setSelectedSession(null)
  }

  const navigationItems = [
    { label: '세션 목록', value: 'sessions' as TabType },
    { label: '클래스 정보', value: 'class-detail' as TabType },
  ]

  return (
    <>
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
        <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
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
            <div className="w-1/2 flex-shrink-0 h-full">
              <SessionCardList
                sessions={filteredSessions}
                onSessionClick={handleSessionClick}
                role={role}
              />
            </div>

            {/* Class Detail Tab */}
            <div className="w-1/2 flex-shrink-0 h-full">
              <ClassDetail
                classId={selectedClass.id}
                classData={selectedClass}
                role={role}
              />
            </div>
          </div>
        </div>
      </SlideUpModal>

      {/* SessionDetailModal */}
      <SessionDetailModal
        isOpen={isSessionDetailModalOpen}
        sessionId={selectedSession?.id || null}
        onClose={closeSessionDetailModal}
        role={role}
        showNavigation={true}
        defaultTab="overview"
      />
    </>
  )
}