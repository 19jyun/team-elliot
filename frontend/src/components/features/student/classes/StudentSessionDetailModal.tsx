'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { ClassDetail } from '@/components/features/student/classes/ClassDetail'
import { SessionDetailTab } from '@/components/features/student/classes/SessionDetailTab'
import { getClassDetails } from '@/api/class'
import { ClassDetailsResponse } from '@/types/api/class'

interface StudentSessionDetailModalProps {
  isOpen: boolean
  session: any
  onClose: () => void
}

type TabType = 'class' | 'session'

// 브라운 테마 색상 정의
const brownTheme = {
  primary: '[#ac9592]',
  secondary: '[#9a8582]', 
  light: '[#ac9592]',
  border: '[#9a8582]',
  hover: '[#8a7572]'
}

export function StudentSessionDetailModal({ 
  isOpen, 
  session, 
  onClose 
}: StudentSessionDetailModalProps) {
  const [classDetails, setClassDetails] = useState<ClassDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('class')

  useEffect(() => {
    if (isOpen && session?.class?.id) {
      loadClassDetails()
    } else {
      // 모달이 닫히거나 session이 없을 때 상태 초기화
      setClassDetails(null)
      setIsLoading(false)
      setActiveTab('class')
    }
  }, [isOpen, session?.class?.id])

  const loadClassDetails = async () => {
    try {
      setIsLoading(true)
      const details = await getClassDetails(session.class.id)
      setClassDetails(details)
    } catch (error) {
      console.error('클래스 상세 정보 로드 실패:', error)
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

  const navigationItems = [
    { label: '클래스 정보', value: 'class' as TabType },
    { label: '수업 내용', value: 'session' as TabType },
  ]

  // session이 없으면 모달을 렌더링하지 않음
  if (!session) {
    return null
  }

  // 탭 인덱스 계산
  const getTabIndex = (tab: TabType) => {
    return navigationItems.findIndex(item => item.value === tab)
  }

  return (
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

      {/* 컨테이너 - 고정 높이로 변경 */}
      <div className="flex flex-col overflow-hidden" style={{ height: '500px' }}>
        <motion.div
          className="flex w-full h-full"
          style={{ width: '200%' }} // 2개 탭
          animate={{ x: -(getTabIndex(activeTab) * 50) + '%' }}
          transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
        >
          {/* 클래스 정보 탭 */}
          <div className="w-1/2 flex-shrink-0 px-1">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
                </div>
              ) : classDetails ? (
                <ClassDetail 
                  classId={session.class.id} 
                  classSessions={[session]} 
                  showModificationButton={true}
                  onModificationClick={onClose}
                />
              ) : (
                <div className="text-center py-8 text-stone-500">
                  클래스 정보를 불러올 수 없습니다.
                </div>
              )}
            </div>
          </div>
          
          {/* 세션 상세 정보 탭 */}
          <div className="w-1/2 flex-shrink-0 px-1">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <SessionDetailTab sessionId={session.id} />
            </div>
          </div>
        </motion.div>
      </div>
    </SlideUpModal>
  )
} 