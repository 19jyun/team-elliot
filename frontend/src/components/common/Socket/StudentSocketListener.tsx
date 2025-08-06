'use client'

import { useSocketEvent } from '@/hooks/socket/useSocket'
import { toast } from 'sonner'

export function StudentSocketListener() {
  // 새로운 실시간 이벤트들 (패킷만 수신, API 호출은 나중에 구현)
  
  // 수강신청 승인 알림
  useSocketEvent('enrollment_accepted', (data) => {
    console.log('📨 수강신청 승인 패킷 수신:', data)
    toast.success('수강 신청이 승인되었습니다!', {
      description: '수강신청 상태가 변경되었습니다.',
    })
    // TODO: API 호출하여 최신 데이터 가져오기
    // loadEnrollmentHistory()
  })

  // 수강신청 거절 알림
  useSocketEvent('enrollment_rejected', (data) => {
    console.log('📨 수강신청 거절 패킷 수신:', data)
    toast.error('수강 신청이 거절되었습니다.', {
      description: '신청 내역에서 거절 사유를 확인하실 수 있습니다.',
    })
    // TODO: API 호출하여 최신 데이터 가져오기
    // loadEnrollmentHistory()
  })

  // 환불 요청 승인 알림
  useSocketEvent('refund_accepted', (data) => {
    console.log('📨 환불 요청 승인 패킷 수신:', data)
    toast.success('환불 요청이 승인되었습니다!', {
      description: '환불 요청 상태가 변경되었습니다.',
    })
    // TODO: API 호출하여 최신 데이터 가져오기
    // loadCancellationHistory()
  })

  // 환불 요청 거절 알림
  useSocketEvent('refund_rejected', (data) => {
    console.log('📨 환불 요청 거절 패킷 수신:', data)
    toast.error('환불 요청이 거절되었습니다.', {
      description: '환불 내역에서 거절 사유를 확인하실 수 있습니다.',
    })
    // TODO: API 호출하여 최신 데이터 가져오기
    // loadCancellationHistory()
  })

  // 연결 확인
  useSocketEvent('connection_confirmed', (data) => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 