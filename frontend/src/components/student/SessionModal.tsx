'use client'

import React from 'react'
import { SlideUpModal } from '@/components/common/SlideUpModal'

interface Session {
  id: number
  classId: number
  date: string
  startTime: string
  endTime: string
  class: {
    id: number
    className: string
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
  if (!isOpen || !selectedClass) return null

  const filteredSessions = sessions.filter((session: any) => session.class.id === selectedClass.id)

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${selectedClass.className} - 세션 목록`}
    >
      <div className="pb-6">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session: any) => (
            <div
              key={`${session.session_id}-${session.enrollment_id}`}
              className="p-4 mb-3 bg-blue-50 rounded-lg border border-blue-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-stone-700">
                    {new Date(session.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                  <p className="text-sm text-stone-500 mt-1">
                    {new Date(session.startTime).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(session.endTime).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.enrollment_status === 'PENDING' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : session.enrollment_status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {session.enrollment_status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-stone-500">
            <p>등록된 세션이 없습니다.</p>
          </div>
        )}
      </div>
    </SlideUpModal>
  )
} 