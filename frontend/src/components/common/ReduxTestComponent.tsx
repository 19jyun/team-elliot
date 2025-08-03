'use client'

import { useAppSelector } from '@/store/hooks'
import { useUser, useAcademy, useEnrollments, useRefundRequests, useClasses, useTeachers, useStudents, useAppState } from '@/hooks/useAppData'

export function ReduxTestComponent() {
  const user = useUser()
  const academy = useAcademy()
  const enrollments = useEnrollments()
  const refundRequests = useRefundRequests()
  const classes = useClasses()
  const teachers = useTeachers()
  const students = useStudents()
  const { isLoading, error, lastUpdated } = useAppState()

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Redux 상태 테스트</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 앱 상태 */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-600">앱 상태</h4>
          <div className="text-sm space-y-1">
            <p>로딩: {isLoading ? '진행 중' : '완료'}</p>
            <p>에러: {error || '없음'}</p>
            <p>마지막 업데이트: {lastUpdated ? new Date(lastUpdated).toLocaleString() : '없음'}</p>
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="space-y-2">
          <h4 className="font-medium text-green-600">사용자 정보</h4>
          <div className="text-sm space-y-1">
            <p>이름: {user?.name || '없음'}</p>
            <p>역할: {user?.role || '없음'}</p>
            <p>이메일: {user?.email || '없음'}</p>
          </div>
        </div>

        {/* 학원 정보 */}
        <div className="space-y-2">
          <h4 className="font-medium text-purple-600">학원 정보</h4>
          <div className="text-sm space-y-1">
            <p>이름: {academy?.name || '없음'}</p>
            <p>전화번호: {academy?.phoneNumber || '없음'}</p>
            <p>주소: {academy?.address || '없음'}</p>
          </div>
        </div>

        {/* 데이터 개수 */}
        <div className="space-y-2">
          <h4 className="font-medium text-orange-600">데이터 개수</h4>
          <div className="text-sm space-y-1">
            <p>수강신청: {enrollments.length}개</p>
            <p>환불요청: {refundRequests.length}개</p>
            <p>클래스: {classes.length}개</p>
            <p>선생님: {teachers.length}개</p>
            <p>학생: {students.length}개</p>
          </div>
        </div>
      </div>

      {/* 상세 데이터 */}
      {enrollments.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-red-600 mb-2">수강신청 상세</h4>
          <div className="text-sm space-y-1">
            {enrollments.map(enrollment => (
              <div key={enrollment.id} className="p-2 bg-gray-50 rounded">
                <p>학생: {enrollment.student.name}</p>
                <p>클래스: {enrollment.session.class.className}</p>
                <p>상태: {enrollment.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {refundRequests.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-red-600 mb-2">환불요청 상세</h4>
          <div className="text-sm space-y-1">
            {refundRequests.map(refund => (
              <div key={refund.id} className="p-2 bg-gray-50 rounded">
                <p>학생: {refund.student.name}</p>
                <p>클래스: {refund.sessionEnrollment.session.class.className}</p>
                <p>상태: {refund.status}</p>
                <p>금액: {refund.refundAmount.toLocaleString()}원</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 