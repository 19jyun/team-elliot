'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi'
import { TeacherSessionEnrollment } from '@/types/api/teacher'
import type { ClassSessionWithCounts } from '@/types/api/class'
import type { AttendanceStatus, EnrollmentStatus } from '@/types/api/common'
import { Checkbox } from '@mui/material'

interface AttendanceDetailComponentProps {
  session: ClassSessionWithCounts | null
  onBack: () => void
}

export function AttendanceDetailComponent({ session, onBack }: AttendanceDetailComponentProps) {
  const { loadSessionEnrollments } = useTeacherApi()
  const [enrollments, setEnrollments] = useState<TeacherSessionEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  // 출석 상태 변경 처리
  const handleAttendanceChange = (enrollmentId: number, isPresent: boolean) => {
    setEnrollments(prev => 
      prev.map(enrollment => 
        enrollment.id === enrollmentId 
          ? { ...enrollment, status: (isPresent ? 'PRESENT' : 'ABSENT') as EnrollmentStatus }
          : enrollment
      )
    )
  }

  // 출석 정보 일괄 저장
  const handleSaveAttendance = async () => {
    try {
      // TODO: 실제 API 호출 구현
      console.log('출석 정보 저장:', enrollments.map(e => ({
        id: e.id,
        studentName: e.student.name,
        status: e.status
      })))
      
      // 임시 알림 (실제 API 연동 시 제거)
      alert('출석 정보가 저장되었습니다.')
    } catch (error) {
      console.error('출석 정보 저장 실패:', error)
      alert('출석 정보 저장에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white p-4 font-pretendard">
        <div className="bg-white border border-[#AC9592] rounded-lg p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AC9592]" />
          </div>
        </div>
      </div>
    )
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white p-4 font-pretendard">
        <div className="bg-white border border-[#AC9592] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">출석부</h3>
          <div className="text-center py-8 text-gray-500">
            수강생 정보가 없습니다.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white p-4 font-pretendard">
      <div className="bg-white rounded-lg p-4 flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold text-[#AC9592] mb-4">출석부</h3>
        
        {/* 출석부 목록 */}
        <div className="space-y-3">
          {enrollments.map((enrollment) => {
            const isPresent = (enrollment.status as string) === 'PRESENT'
            
            return (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                {/* 체크박스 */}
                <div className="flex items-center">
                  <Checkbox
                    checked={isPresent}
                    onChange={(e) => handleAttendanceChange(enrollment.id, e.target.checked)}
                    className="w-5 h-5 rounded focus:ring-[#AC9592] focus:ring-2"
                    sx={{
                      color: '#AC9592',
                      '&.Mui-checked': {
                        color: '#AC9592',
                      },
                    }}
                  />
                </div>
                
                {/* 학생 정보 - 이름과 전화번호를 좌우로 분리 */}
                <div className="flex-1 pl-4 flex justify-between items-center">
                  <span className="text-gray-800 font-medium">
                    {enrollment.student.name || '수강생'}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {enrollment.student.phoneNumber || '전화번호 없음'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 저장하기 버튼 */}
      <div className="mt-4">
        <button
          onClick={handleSaveAttendance}
          className="w-full py-3 rounded-lg text-white text-lg font-semibold transition-colors"
          style={{
            backgroundColor: '#A08B8B',
            fontFamily: 'Pretendard, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#8C7A7A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#A08B8B'
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  )
}
