'use client'

import React, { useState, useEffect } from 'react'
import { SlideUpModal } from '@/components/common/SlideUpModal'
import { ClassDetail } from '@/components/features/student/classes/ClassDetail'
import { getClassDetails } from '@/api/class'
import { ClassDetailsResponse } from '@/types/api/class'

interface StudentSessionDetailModalProps {
  isOpen: boolean
  session: any
  onClose: () => void
}

export function StudentSessionDetailModal({ 
  isOpen, 
  session, 
  onClose 
}: StudentSessionDetailModalProps) {
  const [classDetails, setClassDetails] = useState<ClassDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && session?.class?.id) {
      loadClassDetails()
    } else {
      // 모달이 닫히거나 session이 없을 때 상태 초기화
      setClassDetails(null)
      setIsLoading(false)
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

  const handleModificationClick = () => {
    // 수강 변경 페이지로 이동
    // TODO: 수강 변경 페이지 구현 후 연결
    console.log('수강 변경 페이지로 이동:', session?.class?.id)
  }

  // session이 없으면 모달을 렌더링하지 않음
  if (!session) {
    return null
  }

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title="클래스 상세 정보"
      contentClassName="pb-6"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
          </div>
        ) : classDetails ? (
          <>
            {/* 클래스 상세 정보 */}
            <ClassDetail 
              classId={session.class.id} 
              classSessions={[session]} 
              showModificationButton={true}
            />
          </>
        ) : (
          <div className="text-center py-8 text-stone-500">
            클래스 정보를 불러올 수 없습니다.
          </div>
        )}
      </div>
    </SlideUpModal>
  )
} 