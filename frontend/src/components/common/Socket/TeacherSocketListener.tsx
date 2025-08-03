'use client'

import { useAppDispatch } from '@/store/hooks'
import { useSocketEvent } from '@/hooks/socket/useSocket'
import { 
  updateTeacherEnrollmentFromSocket, 
  updateTeacherSessionFromSocket 
} from '@/store/slices/teacherSlice'
import { toast } from 'sonner'

export function TeacherSocketListener() {
  const dispatch = useAppDispatch()

  // Teacher 전용 이벤트 리스너들
  useSocketEvent('enrollment_status_changed', (data) => {
    
    dispatch(updateTeacherEnrollmentFromSocket(data))
    
    const statusText = data.status === 'CONFIRMED' ? '승인' : '거절'
    toast.success(`수강신청이 ${statusText}되었습니다.`, {
      description: `${data.data.student.name}님의 수강신청`,
    })
  })

  useSocketEvent('refund_request_status_changed', (data) => {
    
    // TODO: Teacher 환불 요청 업데이트 로직 구현
    const statusText = data.status === 'APPROVED' ? '승인' : '거절'
    toast.success(`환불 요청이 ${statusText}되었습니다.`, {
      description: `${data.data.sessionEnrollment.student.name}님의 환불 요청`,
    })
  })

  useSocketEvent('class_info_changed', (data) => {
    toast.info('클래스 정보가 업데이트되었습니다.')
  })

  useSocketEvent('class_reminder', (data) => {
    toast.warning('수업 시간 알림', {
      description: `${data.classData.className} - ${data.message}`,
      duration: 10000,
    })
  })

  useSocketEvent('connection_confirmed', (data) => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 