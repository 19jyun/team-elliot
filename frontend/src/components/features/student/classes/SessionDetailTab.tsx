'use client'

import React from 'react'
import Image from 'next/image'
import { useSessionContents } from '@/hooks/useSessionContents'
import type { SessionDetailTabVM, SessionDetailDisplayVM, SessionContentDisplayVM } from '@/types/view/student'
import { toSessionDetailDisplayVM } from '@/lib/adapters/student'

// 통일된 발레 자세 카드 컴포넌트 (PoseAdditionDetailComponent 스타일 적용)
function UnifiedPoseCard({ content, index }: { content: SessionContentDisplayVM; index: number }) {
  return (
    <div className="flex items-center justify-between p-3 border border-[#AC9592] rounded-lg bg-[#F5F5F5] hover:bg-[#F0F0F0] transition-colors duration-200">
      <div className="flex items-center flex-1">
        <span className="text-[#AC9592] mr-2 font-medium text-sm">{index + 1}</span>
        <div className="flex-1">
          <div className="text-[#573B30] font-medium text-base">{content.pose.name}</div>
          {content.pose.description && (
            <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{content.pose.description}</div>
          )}
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${content.pose.difficultyColor}`}>
        {content.pose.displayDifficulty}
      </span>
    </div>
  )
}

export function SessionDetailTab({ sessionId }: SessionDetailTabVM) {
  const { data: sessionData, isLoading, error } = useSessionContents(sessionId)

  // View Model 생성
  const displayVM: SessionDetailDisplayVM = toSessionDetailDisplayVM(sessionId, sessionData, isLoading, error?.message || null)

  if (displayVM.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (displayVM.error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-red-500 text-lg mb-2">⚠️</div>
        <p className="text-stone-500 text-center">
          수업 내용을 불러오는데 실패했습니다.
        </p>
        <p className="text-sm text-stone-400 mt-1">
          잠시 후 다시 시도해주세요.
        </p>
      </div>
    )
  }

  if (!displayVM.hasContents) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Image
          src="/images/logo/team-eliot-2.png"
          alt="수업 내용 없음"
          width={120}
          height={120}
          className="opacity-50"
        />
        <p className="mt-4 text-stone-500 text-center">
          아직 설정된 발레 자세가 없습니다.
        </p>
        <p className="text-sm text-stone-400 mt-1 text-center">
          강사님이 수업 내용을 설정하면 여기에 표시됩니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 세줄요약 섹션 */}
      {displayVM.sessionSummary && (
        <div className="mb-6 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-[#573B30] mb-2">수업 세 줄 요약</h3>
          <p className="text-sm text-[#573B30] leading-relaxed">
            {displayVM.sessionSummary}
          </p>
        </div>
      )}

      {/* 헤더 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#573B30] mb-2">
          이번 수업에서 배울 자세들
        </h3>
        <p className="text-sm text-stone-500">
          총 {displayVM.contents.length}개의 발레 자세를 순서대로 배워볼 예정입니다.
        </p>
      </div>

      {/* 자세 목록 */}
      <div className="space-y-1.5">
        {displayVM.contents.map((content: SessionContentDisplayVM, index: number) => (
          <UnifiedPoseCard
            key={content.id}
            content={content}
            index={index}
          />
        ))}
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
        <div className="flex items-start gap-3">
          <div className="text-[#ac9592] mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-stone-700 mb-1">
              수업 준비 안내
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              각 자세의 설명을 미리 읽어보시고, 강사님의 노트를 참고하여 수업에 임해주세요. 
              난이도에 따라 체력과 집중력이 필요할 수 있으니 충분한 휴식을 취하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 