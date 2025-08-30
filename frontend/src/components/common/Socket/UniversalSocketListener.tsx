'use client'

import { useAppDispatch } from '@/store/hooks'
import { useSocketEvent } from '@/hooks/socket/useSocket'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

// Principal Redux 액션들
import { 
  setPrincipalData
} from '@/store/slices/principalSlice'

// Teacher Redux 액션들
import {
  updateTeacherEnrollmentFromSocket
} from '@/store/slices/teacherSlice'

// Student Redux 액션들
import {
  updateStudentEnrollmentFromSocket,
  updateStudentCancellationFromSocket
} from '@/store/slices/studentSlice'

// API 함수들
import { 
  getPrincipalAllEnrollments, 
  getPrincipalAllRefundRequests 
} from '@/api/principal'

export function UniversalSocketListener() {
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const currentUserRole = session?.user?.role

  // 수강신청 상태 변경 이벤트
  useSocketEvent('enrollment_status_changed', async (data) => {
    console.log('📢 수강신청 상태 변경:', data)
    
    try {
      // 역할별로 적절한 API 호출 및 Redux 액션 디스패치
      switch (currentUserRole) {
        case 'PRINCIPAL':
          // Principal의 경우 전체 수강신청 목록을 새로 가져와서 업데이트
          const enrollmentsResponse = await getPrincipalAllEnrollments()
          const enrollments = enrollmentsResponse.data || []
          const refundRequestsResponse = await getPrincipalAllRefundRequests()
          const refundRequests = refundRequestsResponse.data || []
          
          dispatch(setPrincipalData({
            enrollments,
            refundRequests,
          }))
          break
          
        case 'TEACHER':
          // Teacher의 경우 소켓 이벤트로 즉시 업데이트
          dispatch(updateTeacherEnrollmentFromSocket(data))
          break
          
        case 'STUDENT':
          // Student의 경우 소켓 이벤트로 즉시 업데이트
          dispatch(updateStudentEnrollmentFromSocket(data))
          break
      }
    } catch (error) {
      console.error('❌ 수강신청 상태 업데이트 실패:', error)
    }
  })

  // 환불 요청 상태 변경 이벤트
  useSocketEvent('refund_request_status_changed', async (data) => {
    console.log('📢 환불 요청 상태 변경:', data)
    
    try {
      // 역할별로 적절한 API 호출 및 Redux 액션 디스패치
      switch (currentUserRole) {
        case 'PRINCIPAL':
          // Principal의 경우 전체 환불요청 목록을 새로 가져와서 업데이트
          const enrollmentsResponse = await getPrincipalAllEnrollments()
          const enrollments = enrollmentsResponse.data || []
          const refundRequestsResponse = await getPrincipalAllRefundRequests()
          const refundRequests = refundRequestsResponse.data || []
          
          dispatch(setPrincipalData({
            enrollments,
            refundRequests,
          }))
          break
          
        case 'STUDENT':
          // Student의 경우 소켓 이벤트로 즉시 업데이트
          dispatch(updateStudentCancellationFromSocket(data))
          break
      }
    } catch (error) {
      console.error('❌ 환불요청 상태 업데이트 실패:', error)
    }
  })


  // 새로운 수강신청 요청 (원장/선생님만)
  useSocketEvent('new_enrollment_request', async (data) => {
    console.log('📨 새로운 수강신청 요청:', data)
    
    if (currentUserRole === 'PRINCIPAL') {
      try {
        // Principal의 경우 전체 수강신청 목록을 새로 가져와서 업데이트
        const enrollmentsResponse = await getPrincipalAllEnrollments()
        const enrollments = enrollmentsResponse.data || []
        const refundRequestsResponse = await getPrincipalAllRefundRequests()
        const refundRequests = refundRequestsResponse.data || []
        
        dispatch(setPrincipalData({
          enrollments,
          refundRequests,
        }))
        
        toast.info('새로운 수강 신청이 도착했습니다.', {
          description: '수강신청 목록을 확인해주세요.',
          duration: 8000,
        })
      } catch (error) {
        console.error('❌ 수강신청 데이터 업데이트 실패:', error)
        toast.error('수강신청 데이터 업데이트에 실패했습니다.')
      }
    }
  })

  // 새로운 환불 요청 (원장만)
  useSocketEvent('new_refund_request', async (data) => {
    console.log('📨 새로운 환불 요청:', data)
    
    if (currentUserRole === 'PRINCIPAL') {
      try {
        // Principal의 경우 전체 환불요청 목록을 새로 가져와서 업데이트
        const enrollmentsResponse = await getPrincipalAllEnrollments()
        const enrollments = enrollmentsResponse.data || []
        const refundRequestsResponse = await getPrincipalAllRefundRequests()
        const refundRequests = refundRequestsResponse.data || []
        
        dispatch(setPrincipalData({
          enrollments,
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
    }
  })

  return null
} 