'use client'

import React, { useState, useEffect } from 'react'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { SessionCardList } from './SessionCardList'
import { ClassDetail } from './ClassDetail'

interface Session {
  id: number
  classId: number
  date: string
  startTime: string
  endTime: string
  class: {
    id: number
    className: string
    level?: string
  }
  session_id: number
  enrollment_status: string
  enrollment_id: number
}

// API 응답 타입과 호환되도록 any 타입도 허용
type SessionData = Session | any

interface ClassData {
  id: number
  className: string
  dayOfWeek: string
  startTime: string
  teacher: {
    id: number
    name: string
  }
}

type TabType = 'sessions' | 'class-detail'

interface ClassSessionModalProps {
  isOpen: boolean
  selectedClass: ClassData | null
  sessions: SessionData[]
  onClose: () => void
  onSessionClick?: (session: SessionData) => void // 세션 클릭 핸들러 추가
}

export function ClassSessionModal({ 
  isOpen, 
  selectedClass, 
  sessions, 
  onClose,
  onSessionClick 
}: ClassSessionModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sessions')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('sessions')
      setIsTransitioning(false)
    }
  }, [isOpen])

  if (!isOpen || !selectedClass) return null

  const filteredSessions = sessions.filter((session: any) => session.class.id === selectedClass.id)

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
    // onSessionClick prop이 있으면 호출, 없으면 기본 동작 (클래스 정보 탭으로 전환)
    if (onSessionClick) {
      onSessionClick(session)
    } else {
      // 기본 동작: 클래스 정보 탭으로 전환
      handleTabChange('class-detail')
    }
  }

  const navigationItems = [
    { label: '세션 목록', value: 'sessions' as TabType },
    { label: '클래스 정보', value: 'class-detail' as TabType }
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
            />
          </div>

          {/* Class Detail Tab */}
          <div className="w-1/2 flex-shrink-0 h-full">
            <ClassDetail
              classId={selectedClass.id}
              classSessions={filteredSessions}
            />
          </div>
        </div>
      </div>
    </SlideUpModal>
  )
} 