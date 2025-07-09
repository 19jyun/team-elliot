'use client'

import React, { useState } from 'react'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { ClassDetailModal } from './ClassDetailModal'
import { SessionCardList } from './SessionCardList'

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

interface SessionModalProps {
  isOpen: boolean
  selectedClass: ClassData | null
  sessions: SessionData[]
  onClose: () => void
}

export function SessionModal({ isOpen, selectedClass, sessions, onClose }: SessionModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedClassSessions, setSelectedClassSessions] = useState<SessionData[]>([])
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false)

  if (!isOpen || !selectedClass) return null

  const filteredSessions = sessions.filter((session: any) => session.class.id === selectedClass.id)

  const handleSessionClick = (session: any) => {

    const classSessions = sessions.filter((s: any) => s.class.id === session.class.id);
    
    setSelectedClassId(session.class.id);
    setSelectedClassSessions(classSessions);
    setIsClassDetailOpen(true);
  }

  const handleClassDetailClose = () => {
    setIsClassDetailOpen(false)
    setSelectedClassId(null)
    setSelectedClassSessions([])
  }

  return (
    <>
      <SlideUpModal
        isOpen={isOpen}
        onClose={onClose}
        title={`${selectedClass.className} - 세션 목록`}
      >
        <SessionCardList
          sessions={filteredSessions}
          onSessionClick={handleSessionClick}
        />
      </SlideUpModal>

      {/* 클래스 상세 정보 모달 */}
      {selectedClassId && (
        <>
          <ClassDetailModal
            isOpen={isClassDetailOpen}
            onClose={handleClassDetailClose}
            classId={selectedClassId}
            classSessions={selectedClassSessions}
          />
        </>
      )}
    </>
  )
} 