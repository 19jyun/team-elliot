'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { getSessionEnrollments } from '@/api/teacher'
import { SessionEnrollmentsResponse } from '@/types/api/teacher'
import { AttendanceTab } from './SessionComponents/Attendance/AttendanceTab'
import { SessionContentTab } from '../../../../common/Session/SessionDetailComponents/Pose/SessionContentTab'
import { PoseSelectionModal } from '../../../../common/Session/SessionDetailComponents/Pose/PoseSelectionModal'
import { useAddSessionContent } from '@/hooks/useSessionContents'
import { BalletPose } from '@/types/api/ballet-pose'

interface TeacherSessionDetailModalProps {
  isOpen: boolean
  session: any
  onClose: () => void
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

export function TeacherSessionDetailModal({ 
  isOpen, 
  session, 
  onClose 
}: TeacherSessionDetailModalProps) {
  const [enrollmentData, setEnrollmentData] = useState<SessionEnrollmentsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isPoseSelectionOpen, setIsPoseSelectionOpen] = useState(false)

  const addContentMutation = useAddSessionContent(session?.id || 0)

  useEffect(() => {
    if (isOpen && session?.id) {
      loadSessionEnrollments()
    } else {
      // 모달이 닫히거나 session이 없을 때 상태 초기화
      setEnrollmentData(null)
      setIsLoading(false)
      setActiveTab('overview')
      setIsPoseSelectionOpen(false)
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

  const navigationItems = [
    { label: '개요', value: 'overview' as TabType },
    { label: '출석체크', value: 'attendance' as TabType },
    { label: '수업 내용', value: 'content' as TabType },
  ]

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
            style={{ width: '300%' }} // 3개 탭
            animate={{ x: -(getTabIndex(activeTab) * 33.333) + '%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
          >
            {/* 개요 탭 */}
            <div className="w-1/3 flex-shrink-0 px-1">
              <div className="h-full overflow-y-auto">
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
              </div>
            </div>
            
            {/* 출석체크 탭 */}
            <div className="w-1/3 flex-shrink-0 px-1">
              <div className="h-full overflow-y-auto">
                <AttendanceTab
                  sessionId={session.id}
                  enrollments={enrollmentData?.enrollments || []}
                  isLoading={isLoading}
                />
              </div>
            </div>
            
            {/* 수업 내용 탭 */}
            <div className="w-1/3 flex-shrink-0 px-1">
              <div className="h-full overflow-y-auto">
                <SessionContentTab 
                  sessionId={session.id} 
                  onAddPoseClick={() => setIsPoseSelectionOpen(true)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </SlideUpModal>

      {/* PoseSelectionModal을 TeacherSessionDetailModal 외부에 렌더링 */}
      <PoseSelectionModal
        isOpen={isPoseSelectionOpen}
        onClose={() => setIsPoseSelectionOpen(false)}
        onSelect={handleAddPose}
      />
    </>
  )
} 