import React from 'react';
import { SessionEnrollment } from '@/types/api/teacher';

interface AttendanceCardProps {
  enrollment: SessionEnrollment;
  onAttendanceChange: (enrollmentId: number, status: 'ATTENDED' | 'ABSENT') => void;
  isUpdating: boolean;
}

export function AttendanceCard({ enrollment, onAttendanceChange, isUpdating }: AttendanceCardProps) {
  const isAttended = enrollment.status === 'ATTENDED';
  const isAbsent = enrollment.status === 'ABSENT';
  
  // 출석체크 가능한 상태인지 확인
  const canCheckAttendance = (status: string) => {
    return status === 'CONFIRMED' || status === 'ATTENDED' || status === 'ABSENT';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg">
      {/* 학생 정보 */}
      <div className="flex-1">
        <div className="font-medium text-stone-700">{enrollment.student.name}</div>
        {enrollment.student.phoneNumber && (
          <div className="text-sm text-stone-500">{enrollment.student.phoneNumber}</div>
        )}
      </div>
      
      {/* 출석/결석 버튼 */}
      {canCheckAttendance(enrollment.status) && (
        <div className="flex items-center gap-2">
          {/* 출석 버튼 (체크 아이콘) */}
          <button
            onClick={() => onAttendanceChange(enrollment.id, 'ATTENDED')}
            disabled={isUpdating}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isAttended 
                ? 'bg-stone-700 text-white' // 선택된 상태: 진한 브라운
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200' // 기본 상태
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="출석"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          
          {/* 결석 버튼 (X 아이콘) */}
          <button
            onClick={() => onAttendanceChange(enrollment.id, 'ABSENT')}
            disabled={isUpdating}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              isAbsent 
                ? 'bg-stone-700 text-white' // 선택된 상태: 진한 브라운
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200' // 기본 상태
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="결석"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* 출석체크 불가능한 경우 상태 표시 */}
      {!canCheckAttendance(enrollment.status) && (
        <div className="flex items-center">
          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
            {enrollment.status === 'PENDING' ? '대기' : 
             enrollment.status === 'CANCELLED' ? '취소' : 
             enrollment.status === 'COMPLETED' ? '완료' : enrollment.status}
          </span>
        </div>
      )}
    </div>
  );
} 