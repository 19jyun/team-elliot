'use client'

import { usePrincipalContext } from '@/contexts/PrincipalContext'
import { usePrincipalData } from '@/hooks/redux/usePrincipalData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, DollarSign } from 'lucide-react'

export function PrincipalRefundClassStep() {
  const { setPersonManagementStep, setSelectedClassId } = usePrincipalContext()
  const { pendingRefundClasses } = usePrincipalData()

  const handleClassClick = (classId: number) => {
    setSelectedClassId(classId)
    setPersonManagementStep('session-list')
  }

  if (pendingRefundClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <DollarSign className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium mb-2">대기 중인 환불요청이 없습니다</h3>
        <p className="text-sm">새로운 환불요청이 들어오면 여기에 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">환불요청 대기 클래스</h2>
        <Badge variant="secondary" className="text-sm">
          총 {pendingRefundClasses.length}개 클래스
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingRefundClasses.map((classData) => (
          <Card
            key={classData.classId}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleClassClick(classData.classId)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-medium line-clamp-2">
                  {classData.className}
                </CardTitle>
                <Badge variant="destructive" className="ml-2 flex-shrink-0">
                  {classData.pendingCount}건
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {classData.currentStudents}/{classData.maxStudents}명
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">강사</span>
                  <span className="font-medium">{classData.teacherName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">레벨</span>
                  <Badge variant="outline" className="text-xs">
                    {classData.level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 