'use client'

import { usePrincipalContext } from '@/contexts/PrincipalContext'
import { usePrincipalData } from '@/hooks/redux/usePrincipalData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, DollarSign } from 'lucide-react'

export function PrincipalRefundSessionStep() {
  const { personManagement, setPersonManagementStep, setSelectedSessionId } = usePrincipalContext()
  const { getClassSessions, getClassRefundRequests, getClassById } = usePrincipalData()

  const selectedClassId = personManagement.selectedClassId
  const selectedClass = selectedClassId ? getClassById(selectedClassId) : null
  const classSessions = selectedClassId ? getClassSessions(selectedClassId) : []
  const classRefundRequests = selectedClassId ? getClassRefundRequests(selectedClassId) : []

  // 세션별 대기 중인 환불요청 수 계산
  const getSessionPendingCount = (sessionId: number) => {
    return classRefundRequests.filter(
      (refund: any) => refund.sessionEnrollment?.session?.id === sessionId && refund.status === 'PENDING'
    ).length
  }

  const handleSessionClick = (sessionId: number) => {
    setSelectedSessionId(sessionId)
    setPersonManagementStep('request-detail')
  }

  if (!selectedClass) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <h3 className="text-lg font-medium mb-2">클래스 정보를 찾을 수 없습니다</h3>
      </div>
    )
  }

  const sessionsWithPendingRefunds = classSessions.filter(
    (session: any) => getSessionPendingCount(session.id) > 0
  )

  if (sessionsWithPendingRefunds.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{selectedClass.className}</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <DollarSign className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium mb-2">대기 중인 환불요청이 없습니다</h3>
          <p className="text-sm">이 클래스의 모든 세션에서 대기 중인 환불요청이 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{selectedClass.className}</h2>
        <p className="text-sm text-gray-600">환불요청 대기 세션</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessionsWithPendingRefunds.map((session: any) => {
          const pendingCount = getSessionPendingCount(session.id)
          return (
            <Card
              key={session.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSessionClick(session.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-medium">
                    {session.date}
                  </CardTitle>
                  <Badge variant="destructive" className="ml-2 flex-shrink-0">
                    {pendingCount}건
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">현재 인원</span>
                    <span className="font-medium">
                      {session.currentStudents}/{session.maxStudents}명
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">상태</span>
                    <Badge variant="outline" className="text-xs">
                      {session.status}
                    </Badge>
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