'use client'

import { useSocketEvent } from '@/hooks/socket/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import { SocketQuerySync } from '@/lib/socket/socketQuerySync'
import { toast } from 'sonner'
import type { SocketEventData, SocketEventName } from '@/types/socket'

export function PrincipalSocketListener() {
  const queryClient = useQueryClient()
  const socketSync = new SocketQuerySync(queryClient)

  // 새로운 수강신청 요청 알림
  useSocketEvent('new_enrollment_request', (data) => {
    console.log('📨 새로운 수강신청 요청 패킷 수신:', data)
    
    // React Query 캐시 무효화
    socketSync.handleSocketEvent('new_enrollment_request', data as SocketEventData<'new_enrollment_request'>)
    
    toast.info('새로운 수강 신청이 도착했습니다.', {
      description: '수강신청 목록을 확인해주세요.',
      duration: 8000,
    })
  })

  // 수강신청 승인/거절 알림
  useSocketEvent('enrollment_accepted', (data) => {
    console.log('📨 수강신청 승인 패킷 수신:', data)
    
    socketSync.handleSocketEvent('enrollment_accepted', data as SocketEventData<'enrollment_accepted'>)
    
    toast.success('수강 신청이 승인되었습니다.')
  })

  useSocketEvent('enrollment_rejected', (data) => {
    console.log('📨 수강신청 거절 패킷 수신:', data)
    
    socketSync.handleSocketEvent('enrollment_rejected', data as SocketEventData<'enrollment_rejected'>)
    
    toast.error('수강 신청이 거절되었습니다.')
  })

  // 새로운 환불 요청 알림
  useSocketEvent('new_refund_request', (data) => {
    console.log('📨 새로운 환불 요청 패킷 수신:', data)
    
    socketSync.handleSocketEvent('new_refund_request', data as SocketEventData<'new_refund_request'>)
    
    toast.info('새로운 환불 요청이 도착했습니다.', {
      description: '환불 요청 목록을 확인해주세요.',
      duration: 8000,
    })
  })

  // 환불 요청 승인/거절 알림
  useSocketEvent('refund_accepted', (data) => {
    console.log('📨 환불 요청 승인 패킷 수신:', data)
    
    socketSync.handleSocketEvent('refund_accepted', data as SocketEventData<'refund_accepted'>)
    
    toast.success('환불 요청이 승인되었습니다.')
  })

  useSocketEvent('refund_rejected', (data) => {
    console.log('📨 환불 요청 거절 패킷 수신:', data)
    
    socketSync.handleSocketEvent('refund_rejected', data as SocketEventData<'refund_rejected'>)
    
    toast.error('환불 요청이 거절되었습니다.')
  })

  // 선생님 가입 신청 알림
  useSocketEvent('teacher_join_request' as SocketEventName, (data) => {
    console.log('📨 선생님 가입 신청 패킷 수신:', data)
    
    socketSync.handleSocketEvent('teacher_join_request', data as Record<string, unknown>)
  })

  useSocketEvent('teacher_join_approved' as SocketEventName, (data) => {
    console.log('📨 선생님 가입 승인 패킷 수신:', data)
    
    socketSync.handleSocketEvent('teacher_join_approved', data as Record<string, unknown>)
  })

  useSocketEvent('teacher_join_rejected' as SocketEventName, (data) => {
    console.log('📨 선생님 가입 거절 패킷 수신:', data)
    
    socketSync.handleSocketEvent('teacher_join_rejected', data as Record<string, unknown>)
  })

  // 세션 관련 이벤트
  useSocketEvent('session_created' as SocketEventName, (data) => {
    console.log('📨 세션 생성 패킷 수신:', data)
    
    socketSync.handleSocketEvent('session_created', data as Record<string, unknown>)
  })

  useSocketEvent('session_updated' as SocketEventName, (data) => {
    console.log('📨 세션 업데이트 패킷 수신:', data)
    
    socketSync.handleSocketEvent('session_updated', data as Record<string, unknown>)
  })

  useSocketEvent('session_deleted' as SocketEventName, (data) => {
    console.log('📨 세션 삭제 패킷 수신:', data)
    
    socketSync.handleSocketEvent('session_deleted', data as Record<string, unknown>)
  })

  // 연결 확인
  useSocketEvent('connection_confirmed', () => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 