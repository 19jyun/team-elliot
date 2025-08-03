'use client'

import { useAppDispatch } from '@/store/hooks'
import { useSocketEvent } from '@/hooks/socket/useSocket'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// Principal Redux 액션들
import { 
  refreshRefundRequests,
  refreshEnrollments,
  refreshClasses,
  refreshTeachers,
  refreshStudents,
  refreshAcademyInfo
} from '@/store/slices/principalSlice'

// Teacher Redux 액션들
import {
  refreshTeacherData,
  refreshTeacherClasses,
  refreshTeacherAcademy,
  refreshTeacherPrincipal
} from '@/store/slices/teacherSlice'

// Student Redux 액션들
import {
  refreshStudentData,
  refreshStudentClasses,
  refreshStudentEnrollmentHistory,
  refreshStudentCancellationHistory
} from '@/store/slices/studentSlice'

export function UniversalSocketListener() {
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const currentUserRole = session?.user?.role

  // 범용 데이터 업데이트 이벤트 - 모든 소켓 이벤트를 이 하나로 통합
  useSocketEvent('data_updated', async (data) => {
    
    // 현재 사용자가 영향을 받는 사용자 목록에 있는지 확인
    const isAffected = data.affectedUsers.some(
      user => user.userId === currentUserId && user.userRole === currentUserRole
    )

    if (!isAffected) {
      return
    }

    try {
      // 사용자 역할에 따라 해당하는 Redux 데이터를 새로고침
      switch (currentUserRole) {
        case 'PRINCIPAL':
          await Promise.all([
            dispatch(refreshEnrollments()).unwrap(),
            dispatch(refreshRefundRequests()).unwrap(),
            dispatch(refreshClasses()).unwrap(),
            dispatch(refreshTeachers()).unwrap(),
            dispatch(refreshStudents()).unwrap(),
            dispatch(refreshAcademyInfo()).unwrap(),
          ])
          break

        case 'TEACHER':
          await Promise.all([
            dispatch(refreshTeacherData()).unwrap(),
            dispatch(refreshTeacherClasses()).unwrap(),
            dispatch(refreshTeacherAcademy()).unwrap(),
            dispatch(refreshTeacherPrincipal()).unwrap(),
          ])
          break

        case 'STUDENT':
          await Promise.all([
            dispatch(refreshStudentData()).unwrap(),
            dispatch(refreshStudentClasses()).unwrap(),
            dispatch(refreshStudentEnrollmentHistory()).unwrap(),
            dispatch(refreshStudentCancellationHistory()).unwrap(),
          ])
          break

        default:
          console.warn('📢 [Universal] 알 수 없는 사용자 역할:', currentUserRole)
          return
      }

      // 성공 메시지 표시
      if (data.message) {
        toast.success(data.message, {
          description: '데이터가 업데이트되었습니다.',
        })
      } else {
        toast.info('데이터가 업데이트되었습니다.', {
          description: `원본 이벤트: ${data.sourceEvent}`,
        })
      }

    } catch (error) {
      console.error('❌ [Universal] 데이터 업데이트 실패:', error)
      toast.error('데이터 업데이트에 실패했습니다.')
    }
  })

  return null // 이 컴포넌트는 UI를 렌더링하지 않음
} 