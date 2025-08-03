'use client'

import { usePrincipalContext } from '@/contexts/PrincipalContext'
import { usePrincipalData } from '@/hooks/redux/usePrincipalData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Calendar, Clock, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { approvePrincipalEnrollment, rejectPrincipalEnrollment } from '@/api/principal'
import { useAppDispatch } from '@/store/hooks'
import { refreshEnrollments } from '@/store/slices/principalSlice'

export function PrincipalEnrollmentRequestStep() {
  const { personManagement, setPersonManagementStep } = usePrincipalContext()
  const { getSessionEnrollments, getClassById, getStudentById } = usePrincipalData()
  const dispatch = useAppDispatch()

  const selectedClassId = personManagement.selectedClassId
  const selectedSessionId = personManagement.selectedSessionId
  const selectedClass = selectedClassId ? getClassById(selectedClassId) : null
  const sessionEnrollments = selectedSessionId ? getSessionEnrollments(selectedSessionId) : []

  const handleApproveEnrollment = async (enrollmentId: number) => {
    try {
      await approvePrincipalEnrollment(enrollmentId)
      toast.success('수강신청이 승인되었습니다.')
      // Redux 상태 새로고침
      dispatch(refreshEnrollments())
    } catch (error) {
      console.error('수강신청 승인 실패:', error)
      toast.error('수강신청 승인에 실패했습니다.')
    }
  }

  const handleRejectEnrollment = async (enrollmentId: number) => {
    try {
      // 간단한 거절 사유 (실제로는 모달이나 입력 폼을 사용해야 함)
      await rejectPrincipalEnrollment(enrollmentId, {
        reason: '원장의 판단에 따라 거절되었습니다.',
        detailedReason: '상세 사유는 별도로 안내드리겠습니다.'
      })
      toast.success('수강신청이 거절되었습니다.')
      // Redux 상태 새로고침
      dispatch(refreshEnrollments())
    } catch (error) {
      console.error('수강신청 거절 실패:', error)
      toast.error('수강신청 거절에 실패했습니다.')
    }
  }

  if (!selectedClass || !selectedSessionId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <h3 className="text-lg font-medium mb-2">정보를 찾을 수 없습니다</h3>
      </div>
    )
  }

  const pendingEnrollments = sessionEnrollments.filter(
    (enrollment) => enrollment.status === 'PENDING'
  )

  if (pendingEnrollments.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{selectedClass.className}</h2>
          <p className="text-sm text-gray-600">수강신청 요청</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <User className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium mb-2">대기 중인 수강신청이 없습니다</h3>
          <p className="text-sm">이 세션에서 대기 중인 수강신청이 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{selectedClass.className}</h2>
        <p className="text-sm text-gray-600">수강신청 요청 ({pendingEnrollments.length}건)</p>
      </div>

      <div className="space-y-4">
        {pendingEnrollments.map((enrollment) => {
          const student = getStudentById(enrollment.studentId) as any
          return (
            <Card key={enrollment.id} className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {student?.name || '학생명 없음'}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {student?.phoneNumber || '연락처 없음'}
                    </p>
                  </div>
                  <Badge variant="secondary">대기 중</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>신청일: {new Date((enrollment as any).enrolledAt).toLocaleDateString()}</span>
                  </div>
                  
                  {student && (
                    <div className="space-y-2 text-sm">
                      {student.birthDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">생년월일</span>
                          <span className="font-medium">{new Date(student.birthDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {student.emergencyContact && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">비상연락처</span>
                          <span className="font-medium">{student.emergencyContact}</span>
                        </div>
                      )}
                      {student.level && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">레벨</span>
                          <span className="font-medium">{student.level}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApproveEnrollment(enrollment.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      승인
                    </Button>
                    <Button
                      onClick={() => handleRejectEnrollment(enrollment.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      거절
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 