'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface AttendanceSummaryComponentProps {
  session: ClassSessionWithCounts | null
  onNavigateToDetail: () => void
}

export function AttendanceSummaryComponent({ session, onNavigateToDetail }: AttendanceSummaryComponentProps) {
  const { loadSessionEnrollments } = useTeacherApi()
  const [_enrollments, setEnrollments] = useState<any[]>([])
  const [_isLoading, setIsLoading] = useState(false)

  // 수강생 정보 로드
  const loadEnrollments = useCallback(async () => {
    if (!session?.id) return
    
    try {
      setIsLoading(true)
      const data = await loadSessionEnrollments(session.id)
      setEnrollments(data?.enrollments || [])
    } catch (error) {
      console.error('수강생 정보 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.id, loadSessionEnrollments])

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])


  return (
    <div 
      className="bg-white border border-[#AC9592] rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onNavigateToDetail}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#AC9592]">출석부</h3>
        <span className="text-[#AC9592]">▼</span>
      </div>
    </div>
  )
}
