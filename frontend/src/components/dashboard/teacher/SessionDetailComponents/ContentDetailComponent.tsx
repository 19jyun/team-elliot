'use client'

import React, { useState, useEffect } from 'react'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface ContentDetailComponentProps {
  session: ClassSessionWithCounts | null
  onBack: () => void
}

export function ContentDetailComponent({ session, onBack }: ContentDetailComponentProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 100자 제한
  const MAX_LENGTH = 100
  const remainingChars = MAX_LENGTH - content.length

  // 수업내용 로드 (임시 - 추후 API 연동)
  useEffect(() => {
    // TODO: 실제 API에서 수업내용 로드
    setContent('오늘은 샤세를 해용')
  }, [session])

  // 수업내용 저장
  const handleSave = async () => {
    if (content.trim().length === 0) {
      alert('수업내용을 입력해주세요.')
      return
    }

    try {
      setIsSaving(true)
      // TODO: 실제 API 호출
      console.log('수업내용 저장:', content)
      
      // 임시 알림
      alert('수업내용이 저장되었습니다.')
    } catch (error) {
      console.error('수업내용 저장 실패:', error)
      alert('수업내용 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white p-4 font-pretendard">
      <div className="bg-white rounded-lg p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-[#AC9592] mb-4">세 줄 요약</h3>
        
        {/* 수업내용 입력 영역 */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#573B30] mb-2">
              오늘의 수업내용을 간단하게 요약하여 입력해주세요!
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_LENGTH}
              placeholder="수업내용을 입력해주세요 (최대 100자)"
              className="w-full h-32 p-3 border border-[#AC9592] rounded-lg resize-none focus:ring-2 focus:ring-[#AC9592] focus:border-[#AC9592] text-gray-800"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-[#573B30]">
                {remainingChars}자 남음
              </span>
              <span className={`text-sm ${remainingChars < 10 ? 'text-red-500' : 'text-[#573B30]'}`}>
                {content.length}/{MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="mt-4">
          <button
            onClick={handleSave}
            disabled={isSaving || content.trim().length === 0}
            className="w-full py-3 rounded-lg text-white text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isSaving ? '#8C7A7A' : '#A08B8B',
              fontFamily: 'Pretendard, sans-serif'
            }}
            onMouseEnter={(e) => {
              if (!isSaving && content.trim().length > 0) {
                e.currentTarget.style.backgroundColor = '#8C7A7A'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = '#A08B8B'
              }
            }}
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
