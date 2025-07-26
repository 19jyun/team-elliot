'use client'

import React from 'react'
import Image from 'next/image'
import { useSessionContents } from '@/hooks/useSessionContents'
import { SessionContent } from '@/types/api/session-content'

interface SessionDetailTabProps {
  sessionId: number
}

// 학생용 발레 자세 카드 컴포넌트
function StudentPoseCard({ content, index }: { content: SessionContent; index: number }) {
  const getDifficultyColor = (difficulty: string) => {
    const colorMap: Record<string, string> = {
      'BEGINNER': 'bg-red-100 text-red-700',
      'INTERMEDIATE': 'bg-yellow-100 text-yellow-700',
      'ADVANCED': 'bg-blue-100 text-blue-700',
    }
    return colorMap[difficulty] || 'bg-gray-100 text-gray-700'
  }

  const getDifficultyText = (difficulty: string) => {
    const textMap: Record<string, string> = {
      'BEGINNER': '초급',
      'INTERMEDIATE': '중급',
      'ADVANCED': '고급',
    }
    return textMap[difficulty] || difficulty
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* 순서 번호와 자세명 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 bg-[#ac9592] text-white rounded-full text-sm font-bold">
            {index + 1}
          </span>
          <h3 className="text-lg font-semibold text-stone-700">
            {content.pose.name}
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(content.pose.difficulty)}`}>
          {getDifficultyText(content.pose.difficulty)}
        </span>
      </div>

      {/* 자세 이미지 (있는 경우) */}
      {content.pose.imageUrl && (
        <div className="mb-3">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={content.pose.imageUrl}
              alt={content.pose.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* 자세 설명 */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-stone-600 mb-2">자세 설명</h4>
        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
          {content.pose.description}
        </p>
      </div>

      {/* 추가 노트 (있는 경우) */}
      {content.notes && (
        <div className="bg-stone-50 rounded-lg p-3 border-l-4 border-[#ac9592]">
          <h4 className="text-sm font-medium text-stone-600 mb-1">강사 노트</h4>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
            {content.notes}
          </p>
        </div>
      )}
    </div>
  )
}

export function SessionDetailTab({ sessionId }: SessionDetailTabProps) {
  const { data: contents, isLoading, error } = useSessionContents(sessionId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    )
  }

  if (error) {
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

  if (!contents || contents.length === 0) {
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
      {/* 헤더 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-stone-700 mb-2">
          이번 수업에서 배울 자세들
        </h3>
        <p className="text-sm text-stone-500">
          총 {contents.length}개의 발레 자세를 순서대로 배워볼 예정입니다.
        </p>
      </div>

      {/* 자세 목록 */}
      <div className="space-y-4">
        {contents.map((content, index) => (
          <StudentPoseCard
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