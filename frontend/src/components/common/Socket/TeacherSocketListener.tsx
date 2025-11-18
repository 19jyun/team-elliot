'use client'

import { useSocketEvent } from '@/hooks/socket/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import { SocketQuerySync } from '@/lib/socket/socketQuerySync'
import { toast } from 'sonner'
import type { SocketEventData } from '@/types/socket'

export function TeacherSocketListener() {
  const queryClient = useQueryClient()
  const socketSync = new SocketQuerySync(queryClient)

  useSocketEvent('new_enrollment_request', (data) => {
    console.log('📨 새로운 수강신청 요청 패킷 수신:', data)
    socketSync.handleSocketEvent('new_enrollment_request', data as SocketEventData<'new_enrollment_request'>)
    toast.info('새로운 수강 신청이 도착했습니다.', {
      description: '수강신청 목록을 확인해주세요.',
      duration: 8000,
    })
  })

  useSocketEvent('new_refund_request', (data) => {
    console.log('📨 새로운 환불 요청 패킷 수신:', data)
    socketSync.handleSocketEvent('new_refund_request', data as SocketEventData<'new_refund_request'>)
    toast.info('새로운 환불 요청이 도착했습니다.', {
      description: '환불 요청 목록을 확인해주세요.',
      duration: 8000,
    })
  })

  // 연결 확인
  useSocketEvent('connection_confirmed', () => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
}