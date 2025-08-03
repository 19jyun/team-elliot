'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { useSocketEvent } from '@/hooks/socket/useSocket'
import { 
  updatePrincipalEnrollmentFromSocket, 
  updatePrincipalRefundRequestFromSocket 
} from '@/store/slices/principalSlice'

import { toast } from 'sonner'

export function SocketListener() {
  const dispatch = useAppDispatch()

  // 수강신청 상태 변경 이벤트 리스너 (Principal & Teacher 공통)
  useSocketEvent('enrollment_status_changed', (data) => {
    
    // Redux 상태 업데이트 (Principal만 - Teacher는 추후 구현)
    dispatch(updatePrincipalEnrollmentFromSocket(data))
    
    // 토스트 알림
    const statusText = data.status === 'CONFIRMED' ? '승인' : '거절'
    toast.success(`수강신청이 ${statusText}되었습니다.`, {
      description: `${data.data.student.name}님의 수강신청`,
    })
  })

  // 환불 요청 상태 변경 이벤트 리스너 (Principal & Teacher 공통)
  useSocketEvent('refund_request_status_changed', (data) => {
    
    // Redux 상태 업데이트 (Principal만 - Teacher는 추후 구현)
    dispatch(updatePrincipalRefundRequestFromSocket(data))
    
    // 토스트 알림
    const statusText = data.status === 'APPROVED' ? '승인' : '거절'
    toast.success(`환불 요청이 ${statusText}되었습니다.`, {
      description: `${data.data.sessionEnrollment.student.name}님의 환불 요청`,
    })
  })

  // 클래스 정보 변경 이벤트 리스너 (Principal & Teacher 공통)
  useSocketEvent('class_info_changed', (data) => {
    
    // TODO: Principal과 Teacher 클래스 정보 업데이트 로직 구현
    toast.info('클래스 정보가 업데이트되었습니다.')
  })

  // 학원 정보 변경 이벤트 리스너 (Principal & Teacher 공통)
  useSocketEvent('academy_info_changed', (data) => {
    
    // TODO: Principal과 Teacher 학원 정보 업데이트 로직 구현
    toast.info('학원 정보가 업데이트되었습니다.')
  })

  // 수업 시간 알림 이벤트 리스너 (Principal & Teacher 공통)
  useSocketEvent('class_reminder', (data) => {
    
    // 토스트 알림
    toast.warning('수업 시간 알림', {
      description: `${data.classData.className} - ${data.message}`,
      duration: 10000, // 10초간 표시
    })
  })



  // 연결 확인 이벤트 리스너
  useSocketEvent('connection_confirmed', (data) => {
    
    // 토스트 알림
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null
} 