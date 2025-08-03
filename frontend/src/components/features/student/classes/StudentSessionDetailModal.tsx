'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { ClassDetail } from '@/components/features/student/classes/ClassDetail'
import { SessionDetailTab } from '@/components/features/student/classes/SessionDetailTab'
import { useStudentData } from '@/hooks/redux/useStudentData'

interface StudentSessionDetailModalProps {
  isOpen: boolean
  session: any
  onClose: () => void
  onlyDetail?: boolean // 세션 상세 정보만 표시할지 여부
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
  onClose,
  onlyDetail = false 
}: StudentSessionDetailModalProps) {
  const { getClassById, isLoading } = useStudentData();
  const [classDetails, setClassDetails] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>('class')

  // 모든 useEffect를 조건부 return 이전에 호출
  useEffect(() => {
    if (isOpen && session?.class?.id) {
      // Redux에서 클래스 정보 가져오기
      const classData = getClassById(session.class.id);
      setClassDetails(classData);
    } else {
      // 모달이 닫히거나 session이 없을 때 상태 초기화
      setClassDetails(null)
      setActiveTab('class')
    }
  }, [isOpen, session?.class?.id, getClassById])

  // onlyDetail이 true이면 기본 탭을 session으로 설정
  useEffect(() => {
    if (onlyDetail) {
      setActiveTab('session');
    }
  }, [onlyDetail]);

  const formatTime = (time: string | Date) => {
    const date = typeof time === 'string' ? new Date(time) : time
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
  }

  // onlyDetail이 true이면 세션 상세 정보만 표시
  const navigationItems = onlyDetail 
    ? [{ label: '수업 내용', value: 'session' as TabType }]
    : [
        { label: '클래스 정보', value: 'class' as TabType },
        { label: '수업 내용', value: 'session' as TabType },
      ];

  // 탭 인덱스 계산 (onlyDetail이 true이면 항상 0)
  const getTabIndex = (tab: TabType) => {
    if (onlyDetail) return 0;
    return navigationItems.findIndex(item => item.value === tab)
  }

  // session이 없으면 모달을 렌더링하지 않음 (모든 Hook 호출 후)
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
      {/* Navigation Bar - onlyDetail이 false일 때만 표시 */}
      {!onlyDetail && (
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
      )}

      {/* 컨테이너 - onlyDetail에 따라 높이 조정 */}
      <div className="flex flex-col overflow-hidden" style={{ height: onlyDetail ? '600px' : '500px' }}>
        {onlyDetail ? (
          // onlyDetail이 true일 때: 세션 상세 정보만 표시
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <SessionDetailTab sessionId={session.id} />
          </div>
        ) : (
          // onlyDetail이 false일 때: 기존 탭 구조 유지
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
        )}
      </div>
    </SlideUpModal>
  )
} 