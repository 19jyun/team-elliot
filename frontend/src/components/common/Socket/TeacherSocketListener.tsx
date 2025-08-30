'use client'

import { useSocketEvent } from '@/hooks/socket/useSocket'
import { toast } from 'sonner'

export function TeacherSocketListener() {
  // 새로운 실시간 이벤트들 (패킷만 수신, API 호출은 나중에 구현)
  
  // 새로운 수강신청 요청 알림
  useSocketEvent('new_enrollment_request', (data) => {
    console.log('📨 새로운 수강신청 요청 패킷 수신:', data)
    toast.info('새로운 수강 신청이 도착했습니다.', {
      description: '수강신청 목록을 확인해주세요.',
      duration: 8000,
    })
    // TODO: API 호출하여 최신 데이터 가져오기
    // loadEnrollmentRequests()
  })

  // 새로운 환불 요청 알림
  useSocketEvent('new_refund_request', (data) => {
    console.log('📨 새로운 환불 요청 패킷 수신:', data)
    toast.info('새로운 환불 요청이 도착했습니다.', {
      description: '환불 요청 목록을 확인해주세요.',
      duration: 8000,
    })
    // TODO: API 호출하여 최신 데이터 가져오기
    // loadRefundRequests()
  })

  // 연결 확인
  useSocketEvent('connection_confirmed', () => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 