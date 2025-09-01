import React from 'react'
import { TeacherSession } from '@/types/api/teacher'
import { toTeacherSessionCardVM } from '@/lib/adapters/teacher'
import { TeacherSessionCardVM } from '@/types/view/teacher'

interface TeacherSessionCardListProps {
  sessions: TeacherSession[]
  onSessionClick: (session: TeacherSession) => void
  isLoading: boolean
}

export const TeacherSessionCardList: React.FC<TeacherSessionCardListProps> = ({
  sessions,
  onSessionClick,
  isLoading,
}) => {
  // ViewModel로 변환
  const sessionVMs: TeacherSessionCardVM[] = sessions.map(toTeacherSessionCardVM)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (!sessionVMs || sessionVMs.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center justify-center py-8 flex-1">
          <p className="text-stone-500 text-center">등록된 세션이 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 스크롤 가능한 리스트 */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex flex-col gap-3 pb-4">
          {sessionVMs.map((sessionVM) => {
            return (
              <div
                key={sessionVM.id}
                className="relative flex flex-col p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-colors"
                style={{ background: sessionVM.levelColor }}
                onClick={() => onSessionClick(sessions.find(s => s.id === sessionVM.id)!)}
              >
                {/* 날짜 정보 */}
                <div style={{
                  color: 'var(--Primary-Dark, #573B30)',
                  fontFamily: 'Pretendard Variable',
                  fontSize: 16,
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '140%',
                  letterSpacing: '-0.16px',
                  marginBottom: '8px',
                }}>
                  {sessionVM.displayDate}
                </div>
                
                {/* 시간 정보 */}
                <div style={{
                  color: 'var(--Primary-Dark, #573B30)',
                  fontFamily: 'Pretendard Variable',
                  fontSize: 14,
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '140%',
                  letterSpacing: '-0.14px',
                }}>
                  {sessionVM.displayTime}
                </div>
                
                {/* 학생수 정보 - 우측 세로 정렬 */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div style={{
                    color: 'var(--Primary-Dark, #573B30)',
                    textAlign: 'center',
                    fontFamily: 'Pretendard Variable',
                    fontSize: 12,
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: '140%',
                    letterSpacing: '-0.12px',
                  }}>
                    {sessionVM.displayCapacity}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 