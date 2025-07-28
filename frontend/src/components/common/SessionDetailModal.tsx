'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { getSessionEnrollments } from '@/api/teacher'
import { getPrincipalSessionEnrollments } from '@/api/principal'
import { SessionEnrollmentsResponse } from '@/types/api/teacher'
import { AttendanceTab } from '@/components/features/teacher/classes/CalendarInteractions/SessionComponents/Attendance/AttendanceTab'
import { SessionContentTab } from '@/components/features/teacher/classes/CalendarInteractions/SessionComponents/Pose/SessionContentTab'
import { PoseSelectionModal } from '@/components/features/teacher/classes/CalendarInteractions/SessionComponents/Pose/PoseSelectionModal'
import { useAddSessionContent } from '@/hooks/useSessionContents'
import { BalletPose } from '@/types/api/ballet-pose'

interface SessionDetailModalProps {
  isOpen: boolean
  session: any
  onClose: () => void
  role: 'student' | 'teacher' | 'principal'
}

type TabType = 'overview' | 'attendance' | 'content'

// 브라운 테마 색상 정의
const brownTheme = {
  primary: '[#ac9592]',
  secondary: '[#9a8582]', 
  light: '[#ac9592]',
  border: '[#9a8582]',
  hover: '[#8a7572]'
}

export function SessionDetailModal({ 
  isOpen, 
  session, 
  onClose,
  role
}: SessionDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isPoseSelectionOpen, setIsPoseSelectionOpen] = useState(false)

  const addContentMutation = useAddSessionContent(session?.id || 0)

  // Teacher와 Principal은 동일한 권한을 가짐
  const canManageSessions = role === 'teacher' || role === 'principal'

  // 선택된 세션의 수강생 목록 조회 (권한별 API 분기)
  const { data: enrollmentData, isLoading } = useQuery({
    queryKey: ['session-enrollments', session?.id, role],
    queryFn: () => {
      if (role === 'teacher') {
        return getSessionEnrollments(session?.id || 0)
      } else if (role === 'principal') {
        return getPrincipalSessionEnrollments(session?.id || 0)
      } else {
        // Student는 수강생 목록을 볼 필요가 없음
        return Promise.resolve(null)
      }
    },
    enabled: isOpen && !!session?.id && canManageSessions,
  })

  useEffect(() => {
    if (isOpen && session?.id) {
      // 모달이 열릴 때 상태 초기화
      setActiveTab('overview')
      setIsPoseSelectionOpen(false)
    }
  }, [isOpen, session?.id])

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

  // 역할별 네비게이션 아이템 설정
  const getNavigationItems = () => {
    const baseItems = [
      { label: '개요', value: 'overview' as TabType }
    ]

    if (canManageSessions) {
      baseItems.push(
        { label: '출석체크', value: 'attendance' as TabType },
        { label: '수업 내용', value: 'content' as TabType }
      )
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  // session이 없으면 모달을 렌더링하지 않음
  if (!session) {
    return null
  }

  // 탭 인덱스 계산
  const getTabIndex = (tab: TabType) => {
    return navigationItems.findIndex(item => item.value === tab)
  }

  // 자세 추가 핸들러
  const handleAddPose = (pose: BalletPose) => {
    addContentMutation.mutate({
      poseId: pose.id,
    });
    setIsPoseSelectionOpen(false);
  };

  return (
    <>
      <SlideUpModal
        isOpen={isOpen}
        onClose={onClose}
        title={`${session?.class?.className} - ${formatTime(session?.startTime)}`}
        contentClassName="pb-6"
      >
        {/* Navigation Bar - 브라운 테마 적용 */}
        <div className="flex border-b border-stone-200 mb-4">
          {navigationItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === item.value
                  ? `text-${brownTheme.primary} border-b-2 border-${brownTheme.primary}`
                  : `text-${brownTheme.secondary} hover:text-${brownTheme.hover}`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 고정 크기 컨테이너 + 슬라이딩 애니메이션 */}
        <div className="relative w-full overflow-hidden" style={{ height: '500px' }}>
          <motion.div
            className="flex w-full"
            style={{ width: `${navigationItems.length * 100}%` }}
            animate={{ x: -(getTabIndex(activeTab) * (100 / navigationItems.length)) + '%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
          >
            {/* 개요 탭 */}
            <div className={`w-${100 / navigationItems.length}% flex-shrink-0 px-1`}>
              <div className="h-full overflow-y-auto">
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
                    </div>
                  ) : enrollmentData ? (
                    <>
                      {/* 세션 기본 정보 */}
                      <div className="bg-stone-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-stone-700 mb-3">세션 정보</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-600">날짜:</span>
                            <span className="text-stone-700">{new Date(session.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-600">시간:</span>
                            <span className="text-stone-700">{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-600">클래스:</span>
                            <span className="text-stone-700">{session.class?.className}</span>
                          </div>
                        </div>
                      </div>

                      {/* 수강생 현황 */}
                      <div className="bg-stone-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-stone-700 mb-3">수강생 현황</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-stone-600">전체 수강생:</span>
                            <span className="text-sm font-medium text-stone-700">{enrollmentData.enrollments?.length || 0}명</span>
                          </div>
                          {enrollmentData.statusCounts && (
                            <div className="space-y-1">
                              {Object.entries(enrollmentData.statusCounts).map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center">
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>
                                    {getStatusText(status)}
                                  </span>
                                  <span className="text-sm text-stone-700">{count}명</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 수강생 목록 */}
                      <div className="bg-stone-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-stone-700 mb-3">수강생 목록</h3>
                        <div className="space-y-2">
                          {enrollmentData.enrollments?.map((enrollment: any) => (
                            <div key={enrollment.id} className="flex justify-between items-center p-2 bg-white rounded border">
                              <div>
                                <span className="text-sm font-medium text-stone-700">{enrollment.student.name}</span>
                                <span className="text-xs text-stone-500 ml-2">{enrollment.student.phoneNumber}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(enrollment.status)}`}>
                                {getStatusText(enrollment.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-stone-500">
                      수강생 정보를 불러올 수 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 출석체크 탭 (Teacher/Principal만) */}
            {canManageSessions && (
              <div className={`w-${100 / navigationItems.length}% flex-shrink-0 px-1`}>
                <div className="h-full overflow-y-auto">
                  <AttendanceTab
                    sessionId={session.id}
                    enrollments={enrollmentData?.enrollments || []}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
            
            {/* 수업 내용 탭 (Teacher/Principal만) */}
            {canManageSessions && (
              <div className={`w-${100 / navigationItems.length}% flex-shrink-0 px-1`}>
                <div className="h-full overflow-y-auto">
                  <SessionContentTab 
                    sessionId={session.id} 
                    onAddPoseClick={() => setIsPoseSelectionOpen(true)}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </SlideUpModal>

      {/* PoseSelectionModal을 SessionDetailModal 외부에 렌더링 */}
      {canManageSessions && (
        <PoseSelectionModal
          isOpen={isPoseSelectionOpen}
          onClose={() => setIsPoseSelectionOpen(false)}
          onSelect={handleAddPose}
        />
      )}
    </>
  )
} 