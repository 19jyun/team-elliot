'use client'

import { useAppDispatch } from '@/store/hooks'
import { useSocketEvent } from '@/hooks/socket/useSocket'
import { toast } from 'sonner'

export function AdminSocketListener() {
  const dispatch = useAppDispatch()

  // Admin 전용 이벤트 리스너들
  useSocketEvent('enrollment_status_changed', (data) => {
    toast.info('수강신청 상태가 변경되었습니다.')
  })

  useSocketEvent('refund_request_status_changed', (data) => {
    toast.info('환불 요청 상태가 변경되었습니다.')
  })

  useSocketEvent('class_info_changed', (data) => {
    toast.info('클래스 정보가 업데이트되었습니다.')
  })

  useSocketEvent('academy_info_changed', (data) => {
    toast.info('학원 정보가 업데이트되었습니다.')
  })

  useSocketEvent('connection_confirmed', (data) => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 