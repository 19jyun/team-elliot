'use client'

import { useAppDispatch } from '@/store/hooks'
import { useSocketEvent } from '@/hooks/socket/useSocket'
import { 
  updatePrincipalEnrollmentFromSocket, 
  updatePrincipalRefundRequestFromSocket 
} from '@/store/slices/principalSlice'
import { toast } from 'sonner'

export function PrincipalSocketListener() {
  const dispatch = useAppDispatch()

  // Principal 전용 이벤트 리스너들
  useSocketEvent('enrollment_status_changed', (data) => {
    console.log('📢 [Principal] 수강신청 상태 변경:', data)
    
    dispatch(updatePrincipalEnrollmentFromSocket(data))
    
    const statusText = data.status === 'CONFIRMED' ? '승인' : '거절'
    toast.success(`수강신청이 ${statusText}되었습니다.`, {
      description: `${data.data.student.name}님의 수강신청`,
    })
  })

  useSocketEvent('refund_request_status_changed', (data) => {
    console.log('📢 [Principal] 환불 요청 상태 변경:', data)
    
    dispatch(updatePrincipalRefundRequestFromSocket(data))
    
    const statusText = data.status === 'APPROVED' ? '승인' : '거절'
    toast.success(`환불 요청이 ${statusText}되었습니다.`, {
      description: `${data.data.sessionEnrollment.student.name}님의 환불 요청`,
    })
  })

  useSocketEvent('class_info_changed', (data) => {
    console.log('📢 [Principal] 클래스 정보 변경:', data)
    toast.info('클래스 정보가 업데이트되었습니다.')
  })

  useSocketEvent('academy_info_changed', (data) => {
    console.log('📢 [Principal] 학원 정보 변경:', data)
    toast.info('학원 정보가 업데이트되었습니다.')
  })

  useSocketEvent('class_reminder', (data) => {
    console.log('📢 [Principal] 수업 시간 알림:', data)
    toast.warning('수업 시간 알림', {
      description: `${data.classData.className} - ${data.message}`,
      duration: 10000,
    })
  })

  useSocketEvent('connection_confirmed', (data) => {
    console.log('✅ [Principal] Socket 연결 확인:', data)
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 