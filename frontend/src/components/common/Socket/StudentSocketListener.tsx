'use client'

import { useAppDispatch } from '@/store/hooks'
import { useSocketEvent } from '@/hooks/socket/useSocket'
import { toast } from 'sonner'

export function StudentSocketListener() {
  const dispatch = useAppDispatch()

  // Student 전용 이벤트 리스너들
  useSocketEvent('enrollment_status_changed', (data) => {
    console.log('📢 [Student] 수강신청 상태 변경:', data)
    
    const statusText = data.status === 'CONFIRMED' ? '승인' : '거절'
    toast.success(`수강신청이 ${statusText}되었습니다.`, {
      description: '수강신청 상태가 변경되었습니다.',
    })
  })

  useSocketEvent('refund_request_status_changed', (data) => {
    console.log('📢 [Student] 환불 요청 상태 변경:', data)
    
    const statusText = data.status === 'APPROVED' ? '승인' : '거절'
    toast.success(`환불 요청이 ${statusText}되었습니다.`, {
      description: '환불 요청 상태가 변경되었습니다.',
    })
  })

  useSocketEvent('class_reminder', (data) => {
    console.log('📢 [Student] 수업 시간 알림:', data)
    toast.warning('수업 시간 알림', {
      description: `${data.classData.className} - ${data.message}`,
      duration: 10000,
    })
  })

  useSocketEvent('connection_confirmed', (data) => {
    console.log('✅ [Student] Socket 연결 확인:', data)
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 