'use client'

import React, { useState, useEffect } from 'react'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { getSessionEnrollments } from '@/api/teacher'
import { SessionEnrollmentsResponse } from '@/types/api/teacher'

interface TeacherSessionDetailModalProps {
  isOpen: boolean
  session: any
  onClose: () => void
}

export function TeacherSessionDetailModal({ 
  isOpen, 
  session, 
  onClose 
}: TeacherSessionDetailModalProps) {
  const [enrollmentData, setEnrollmentData] = useState<SessionEnrollmentsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && session?.id) {
      loadSessionEnrollments()
    } else {
      // 모달이 닫히거나 session이 없을 때 상태 초기화
      setEnrollmentData(null)
      setIsLoading(false)
    }
  }, [isOpen, session?.id])

  const loadSessionEnrollments = async () => {
    try {
      setIsLoading(true)
      const data = await getSessionEnrollments(session.id)
      setEnrollmentData(data)
    } catch (error) {
      console.error('세션 수강생 정보 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (time: string | Date) => {
    const date = typeof time === 'string' ? new Date(time) : time
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '대기',
      'CONFIRMED': '확정',
      'CANCELLED': '취소',
      'ATTENDED': '출석',
      'ABSENT': '결석',
      'COMPLETED': '완료'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'CONFIRMED': 'text-green-600 bg-green-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'ATTENDED': 'text-blue-600 bg-blue-100',
      'ABSENT': 'text-gray-600 bg-gray-100',
      'COMPLETED': 'text-purple-600 bg-purple-100'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-100'
  }

  // session이 없으면 모달을 렌더링하지 않음
  if (!session) {
    return null
  }

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${session?.class?.className} - ${formatTime(session?.startTime)}`}
      contentClassName="pb-6"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
          </div>
        ) : enrollmentData ? (
          <>
            {/* 세션 정보 요약 */}
            <div className="bg-stone-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-stone-600">수강생 현황</span>
                <span className="text-sm text-stone-500">
                  {enrollmentData.totalCount}명
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                {Object.entries(enrollmentData.statusCounts).map(([status, count]) => (
                  count > 0 && (
                    <span
                      key={status}
                      className={`px-2 py-1 rounded ${getStatusColor(status)}`}
                    >
                      {getStatusText(status)}: {count}명
                    </span>
                  )
                ))}
              </div>
            </div>

            {/* 수강생 목록 */}
            <div>
              <h4 className="text-base font-semibold text-stone-700 mb-3">
                수강생 목록
              </h4>
              <div className="space-y-3">
                {enrollmentData.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-stone-700">
                        {enrollment.student.name}
                      </div>
                      {enrollment.student.phoneNumber && (
                        <div className="text-sm text-stone-500">
                          {enrollment.student.phoneNumber}
                        </div>
                      )}
                      {enrollment.student.level && (
                        <div className="text-xs text-stone-400">
                          레벨: {enrollment.student.level}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${getStatusColor(enrollment.status)}`}
                      >
                        {getStatusText(enrollment.status)}
                      </span>
                      {enrollment.payment && (
                        <span className="text-xs text-green-600">
                          결제완료
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 클래스 정보 */}
            <div>
              <h4 className="text-base font-semibold text-stone-700 mb-3">
                클래스 정보
              </h4>
              <div className="bg-stone-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">클래스명:</span>
                    <span className="font-medium">{session.class.className}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">시간:</span>
                    <span className="font-medium">
                      {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">최대 인원:</span>
                    <span className="font-medium">{session.class.maxStudents}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">레벨:</span>
                    <span className="font-medium">{session.class.level}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-stone-500">
            수강생 정보를 불러올 수 없습니다.
          </div>
        )}
      </div>
    </SlideUpModal>
  )
} 