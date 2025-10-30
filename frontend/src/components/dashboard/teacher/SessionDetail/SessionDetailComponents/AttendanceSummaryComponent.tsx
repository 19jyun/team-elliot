'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTeacherApi } from '@/hooks/teacher/useTeacherApi'
import { usePrincipalApi } from '@/hooks/principal/usePrincipalApi'
import { useSession } from '@/lib/auth/AuthProvider'
import { useSessionContents, useBatchCheckAttendance } from '@/hooks/useSessionContents'
import { TeacherSessionEnrollment } from '@/types/api/teacher'
import type { ClassSessionWithCounts } from '@/types/api/class'
import type { AttendanceStatus } from '@/types/api/common'
import type { AttendanceItem } from '@/types/api/session-content'
import { Checkbox } from '@mui/material'

interface AttendanceSummaryComponentProps {
  session: ClassSessionWithCounts | null
}

export function AttendanceSummaryComponent({ session }: AttendanceSummaryComponentProps) {
  const { data: userSession } = useSession()
  const userRole = userSession?.user?.role || 'STUDENT'
  
  // 역할에 따라 다른 API 훅 사용
  const teacherApi = useTeacherApi()
  const principalApi = usePrincipalApi()
  
  const [enrollments, setEnrollments] = useState<TeacherSessionEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // useSessionContents 훅 사용
  const sessionId = session?.id || 0
  const { data: _sessionContents, isLoading: contentsLoading } = useSessionContents(sessionId)
  
  // 일괄 출석 체크를 위한 훅 (sessionId 전달)
  const batchCheckAttendanceMutation = useBatchCheckAttendance(sessionId)

  // 수강생 정보 로드 (역할에 따라 다른 API 사용)
  const loadEnrollments = useCallback(async () => {
    if (!session?.id) return
    
    try {
      setIsLoading(true)
      let data = null
      
      if (userRole === 'TEACHER') {
        data = await teacherApi.loadSessionEnrollments(session.id)
      } else if (userRole === 'PRINCIPAL') {
        data = await principalApi.loadSessionEnrollments(session.id)
      }
      
      setEnrollments(data?.enrollments || [])
    } catch (error) {
      console.error('수강생 정보 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, userRole])

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])

  // 출석 상태 변경 처리
  const handleAttendanceChange = (enrollmentId: number, isPresent: boolean) => {
    setEnrollments(prev => 
      prev.map(enrollment => 
        enrollment.id === enrollmentId 
          ? { ...enrollment, attendanceStatus: (isPresent ? 'PRESENT' : 'ABSENT') as AttendanceStatus }
          : enrollment
      )
    )
  }

  // 출석 정보 일괄 저장
  const handleSaveAttendance = async () => {
    try {
      // 출석 데이터 준비
      const attendanceData: AttendanceItem[] = enrollments.map(enrollment => ({
        enrollmentId: enrollment.id,
        status: (enrollment.attendanceStatus as string) === 'PRESENT' ? 'PRESENT' : 'ABSENT' as "PRESENT" | "ABSENT"
      }))
      
      // 일괄 출석 체크 실행
      await batchCheckAttendanceMutation.mutateAsync(attendanceData)
      
      // 성공 시 데이터 다시 로드 및 접기
      await loadEnrollments()
      setIsExpanded(false)
    } catch (error) {
      console.error('출석 정보 저장 실패:', error)
    }
  }

  // 토글 핸들러
  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {/* 헤더 - 클릭 시 토글 */}
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <h3 className="text-lg font-semibold text-[#573B30]">출석부</h3>
        <span className={`text-[#AC9592] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {/* 확장된 내용 */}
      {isExpanded && (
        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {isLoading || contentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AC9592]" />
            </div>
          ) : !enrollments || enrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              수강생 정보가 없습니다.
            </div>
          ) : (
            <>
              {/* 출석부 목록 */}
              <div className="space-y-3 mb-4">
                {enrollments.map((enrollment) => {
                  const isPresent = (enrollment.attendanceStatus as string) === 'PRESENT'
                  
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

              {/* 저장하기 버튼 */}
              <button
                onClick={handleSaveAttendance}
                disabled={batchCheckAttendanceMutation.isPending}
                className="w-full py-3 rounded-lg text-white text-lg font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: batchCheckAttendanceMutation.isPending ? '#8C7A7A' : '#A08B8B',
                  fontFamily: 'Pretendard, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!batchCheckAttendanceMutation.isPending) {
                    e.currentTarget.style.backgroundColor = '#8C7A7A'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!batchCheckAttendanceMutation.isPending) {
                    e.currentTarget.style.backgroundColor = '#A08B8B'
                  }
                }}
              >
                {batchCheckAttendanceMutation.isPending ? '저장 중...' : '저장하기'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
