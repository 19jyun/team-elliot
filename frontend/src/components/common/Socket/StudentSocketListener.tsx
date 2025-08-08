'use client'

import { useSocketEvent } from '@/hooks/socket/useSocket'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store/hooks'
import { 
  updateStudentEnrollmentHistory,
  updateStudentCancellationHistory,
} from '@/store/slices/studentSlice'
import { useStudentApi } from '@/hooks/student/useStudentApi'

export function StudentSocketListener() {
  const dispatch = useAppDispatch()
  const { loadEnrollmentHistory, loadCancellationHistory } = useStudentApi()
  // 새로운 실시간 이벤트들 (패킷만 수신, API 호출은 나중에 구현)
  
  // 수강신청 승인 알림
  useSocketEvent('enrollment_accepted', (data) => {
    console.log('📨 수강신청 승인 패킷 수신:', data)
    toast.success('수강 신청이 승인되었습니다!')
    ;(async () => {
      try {
        const history = await loadEnrollmentHistory()
        dispatch(updateStudentEnrollmentHistory(history))
      } catch (error) {
        console.error('❌ 수강신청 내역 갱신 실패:', error)
      }
    })()
  })

  // 수강신청 거절 알림
  useSocketEvent('enrollment_rejected', (data) => {
    console.log('📨 수강신청 거절 패킷 수신:', data)
    toast.error('수강 신청이 거절되었습니다.', {
      description: '신청 내역에서 거절 사유를 확인하실 수 있습니다.',
    })
    ;(async () => {
      try {
        const history = await loadEnrollmentHistory()
        dispatch(updateStudentEnrollmentHistory(history))
      } catch (error) {
        console.error('❌ 수강신청 내역 갱신 실패:', error)
      }
    })()
  })

  // 환불 요청 승인 알림
  useSocketEvent('refund_accepted', (data) => {
    console.log('📨 환불 요청 승인 패킷 수신:', data)
    toast.success('환불 요청이 승인되었습니다!')
    ;(async () => {
      try {
        const history = await loadCancellationHistory()
        dispatch(updateStudentCancellationHistory(history))
      } catch (error) {
        console.error('❌ 환불/취소 내역 갱신 실패:', error)
      }
    })()
  })

  // 환불 요청 거절 알림
  useSocketEvent('refund_rejected', (data) => {
    console.log('📨 환불 요청 거절 패킷 수신:', data)
    toast.error('환불 요청이 거절되었습니다.', {
      description: '환불 내역에서 거절 사유를 확인하실 수 있습니다.',
    })
    ;(async () => {
      try {
        const history = await loadCancellationHistory()
        dispatch(updateStudentCancellationHistory(history))
      } catch (error) {
        console.error('❌ 환불/취소 내역 갱신 실패:', error)
      }
    })()
  })

  // 연결 확인
  useSocketEvent('connection_confirmed', (data) => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 