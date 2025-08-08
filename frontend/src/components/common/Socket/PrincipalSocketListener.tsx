'use client'

import { useSocketEvent } from '@/hooks/socket/useSocket'
import { useAppDispatch } from '@/store/hooks'
import { setPrincipalData } from '@/store/slices/principalSlice'
import { getPrincipalAllEnrollments, getPrincipalAllRefundRequests } from '@/api/principal'
import { toast } from 'sonner'

export function PrincipalSocketListener() {
  const dispatch = useAppDispatch()

  // 새로운 수강신청 요청 알림
  useSocketEvent('new_enrollment_request', async (data) => {
    console.log('📨 새로운 수강신청 요청 패킷 수신:', data)
    
    try {
      // 수강신청 목록 API 호출하여 Redux 업데이트
      const enrollments = await getPrincipalAllEnrollments()
      
      // 기존 환불요청 데이터 유지하면서 수강신청만 업데이트
      const currentData = await getPrincipalAllRefundRequests()
      
      dispatch(setPrincipalData({
        enrollments,
        refundRequests: currentData,
      }))
      
      toast.info('새로운 수강 신청이 도착했습니다.', {
        description: '수강신청 목록을 확인해주세요.',
        duration: 8000,
      })
    } catch (error) {
      console.error('❌ 수강신청 데이터 업데이트 실패:', error)
      toast.error('수강신청 데이터 업데이트에 실패했습니다.')
    }
  })

  // 새로운 환불 요청 알림
  useSocketEvent('new_refund_request', async (data) => {
    console.log('📨 새로운 환불 요청 패킷 수신:', data)
    
    try {
      // 환불요청 목록 API 호출하여 Redux 업데이트
      const refundRequests = await getPrincipalAllRefundRequests()
      
      // 기존 수강신청 데이터 유지하면서 환불요청만 업데이트
      const currentData = await getPrincipalAllEnrollments()
      
      dispatch(setPrincipalData({
        enrollments: currentData,
        refundRequests,
      }))
      
      toast.info('새로운 환불 요청이 도착했습니다.', {
        description: '환불 요청 목록을 확인해주세요.',
        duration: 8000,
      })
    } catch (error) {
      console.error('❌ 환불요청 데이터 업데이트 실패:', error)
      toast.error('환불요청 데이터 업데이트에 실패했습니다.')
    }
  })

  // 연결 확인
  useSocketEvent('connection_confirmed', (data) => {
    toast.success('실시간 연결이 설정되었습니다.', {
      description: '이제 실시간 업데이트를 받을 수 있습니다.',
    })
  })

  return null
} 