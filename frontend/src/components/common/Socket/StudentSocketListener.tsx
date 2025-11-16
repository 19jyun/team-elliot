'use client'

import { useSocketEvent } from '@/hooks/socket/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import { SocketQuerySync } from '@/lib/socket/socketQuerySync'
import { toast } from 'sonner'
import type { SocketEventData, SocketEventName } from '@/types/socket'

export function StudentSocketListener() {
  const queryClient = useQueryClient()
  const socketSync = new SocketQuerySync(queryClient)
  
  // 수강신청 승인 알림
  useSocketEvent('enrollment_accepted', (data) => {
    console.log('📨 수강신청 승인 패킷 수신:', data)
    
    // React Query 캐시 무효화
    socketSync.handleSocketEvent('enrollment_accepted', data as SocketEventData<'enrollment_accepted'>)
    
    toast.success('수강 신청이 승인되었습니다!')
  })

  // 수강신청 거절 알림
  useSocketEvent('enrollment_rejected', (data) => {
    console.log('📨 수강신청 거절 패킷 수신:', data)
    
    socketSync.handleSocketEvent('enrollment_rejected', data as SocketEventData<'enrollment_rejected'>)
    
    toast.error('수강 신청이 거절되었습니다.', {
      description: '신청 내역에서 거절 사유를 확인하실 수 있습니다.',
    })
  })

  // 환불 요청 승인 알림
  useSocketEvent('refund_accepted', (data) => {
    console.log('📨 환불 요청 승인 패킷 수신:', data)
    
    socketSync.handleSocketEvent('refund_accepted', data as SocketEventData<'refund_accepted'>)
    
    toast.success('환불 요청이 승인되었습니다!')
  })

  // 환불 요청 거절 알림
  useSocketEvent('refund_rejected', (data) => {
    console.log('📨 환불 요청 거절 패킷 수신:', data)
    
    socketSync.handleSocketEvent('refund_rejected', data as SocketEventData<'refund_rejected'>)
    
    toast.error('환불 요청이 거절되었습니다.', {
      description: '환불 내역에서 거절 사유를 확인하실 수 있습니다.',
    })
  })

  // 세션 관련 이벤트
  useSocketEvent('session_created', (data) => {
    console.log('📨 세션 생성 패킷 수신:', data)
    
    socketSync.handleSocketEvent('session_created', data as SocketEventData<'session_created'>)
  })

  useSocketEvent('session_updated', (data) => {
    console.log('📨 세션 업데이트 패킷 수신:', data)
    
    socketSync.handleSocketEvent('session_updated', data as SocketEventData<'session_updated'>)
  })

  useSocketEvent('session_deleted', (data) => {
    console.log('📨 세션 삭제 패킷 수신:', data)
    
    socketSync.handleSocketEvent('session_deleted', data as SocketEventData<'session_deleted'>)
  })

  // 연결 확인
  useSocketEvent('connection_confirmed', () => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 