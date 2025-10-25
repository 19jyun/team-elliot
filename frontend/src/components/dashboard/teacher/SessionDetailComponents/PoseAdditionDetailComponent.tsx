'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { SeparatorInput } from '@/components/ui/separator-input'
import { useBalletPoses } from '@/hooks/useBalletPoses'
import { useSessionContents, useAddSessionContent } from '@/hooks/useSessionContents'
import { BalletPose } from '@/types/api/ballet-pose'
import type { ClassSessionWithCounts } from '@/types/api/class'

interface PoseAdditionDetailComponentProps {
  session: ClassSessionWithCounts | null
  onBack: () => void
}

export function PoseAdditionDetailComponent({ session, onBack }: PoseAdditionDetailComponentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPoses, setSelectedPoses] = useState<BalletPose[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const sessionId = session?.id || 0
  
  // 자세 데이터 로드
  const { data: allPoses, isLoading: posesLoading } = useBalletPoses()
  
  // 기존 세션 내용 로드
  const { data: existingContents, isLoading: contentsLoading } = useSessionContents(sessionId)
  
  // 자세 추가 API
  const addContentMutation = useAddSessionContent(sessionId)
  
  // 검색된 자세들 필터링
  const filteredPoses = useMemo(() => {
    if (!allPoses) return []
    if (!searchQuery.trim()) return allPoses
    
    return allPoses.filter(pose => 
      pose.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pose.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allPoses, searchQuery])

  // 기존 자세들을 selectedPoses에 초기화
  useEffect(() => {
    if (existingContents && existingContents.length > 0) {
      const existingPoses = existingContents.map((content: any) => content.pose)
      setSelectedPoses(existingPoses)
    }
  }, [existingContents])

  // 자세 선택 처리
  const handlePoseSelect = async (pose: BalletPose) => {
    // 이미 선택된 자세인지 확인
    if (selectedPoses.find(p => p.id === pose.id)) {
      return
    }

    try {
      // API 호출하여 자세 추가
      await addContentMutation.mutateAsync({
        poseId: pose.id,
        notes: ''
      })
      
      // 로컬 상태 업데이트
      setSelectedPoses(prev => [...prev, pose])
    } catch (error) {
      console.error('자세 추가 실패:', error)
      alert('자세 추가에 실패했습니다.')
    }
  }

  // 자세 제거 처리 (현재는 로컬 상태만 업데이트, 추후 API 연동 필요)
  const handlePoseRemove = (poseId: number) => {
    setSelectedPoses(prev => prev.filter(pose => pose.id !== poseId))
    // TODO: API 호출하여 자세 제거
    console.log('자세 제거:', poseId)
  }

  // 저장 처리 (현재는 선택된 자세들이 이미 저장된 상태)
  const handleSave = async () => {
    try {
      setIsLoading(true)
      // 선택된 자세들이 이미 API를 통해 저장되었으므로 성공 메시지만 표시
      alert('자세가 저장되었습니다.')
    } catch (error) {
      console.error('저장 실패:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white p-4 font-pretendard">
      {/* 검색 입력 영역 */}
      <div className="mb-4">
        <SeparatorInput
          title="자세 검색"
          placeholder=""
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          containerClassName="border border-[#AC9592] rounded-lg focus-within:ring-2 focus-within:ring-[#AC9592] focus-within:border-[#AC9592]"
          titleClassName="text-[#AC9592] font-medium"
        />
      </div>

      {/* 자세 목록 영역 */}
      <div className="flex-1 overflow-y-auto mb-4">
        {posesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[#AC9592]">자세 목록을 불러오는 중...</div>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredPoses.map((pose, index) => {
              const isSelected = selectedPoses.find(p => p.id === pose.id)
              return (
                <div
                  key={pose.id}
                  onClick={() => handlePoseSelect(pose)}
                  className={`p-4 border-b border-gray-200 cursor-pointer transition-colors last:border-b-0 ${
                    isSelected 
                      ? 'bg-[#F5F5F5] text-[#AC9592]' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="text-gray-800 font-medium text-lg">{pose.name}</div>
                  {pose.description && (
                    <div className="text-sm text-gray-600 mt-1">{pose.description}</div>
                  )}
                  {isSelected && (
                    <div className="text-sm text-[#AC9592] mt-1">✓ 추가됨</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 선택된 자세 영역 */}
      {selectedPoses.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#AC9592] mb-3">추가된 수업내용</h3>
          <div className="space-y-2">
            {selectedPoses.map((pose) => (
              <div
                key={pose.id}
                className="flex items-center justify-between p-4 bg-[#F5F5F5] border border-[#AC9592] rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-[#573B30] font-medium text-lg">{pose.name}</div>
                  {pose.description && (
                    <div className="text-sm text-[#8B7355] mt-1">{pose.description}</div>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-[#AC9592] mr-2">›</span>
                  <button
                    onClick={() => handlePoseRemove(pose.id)}
                    className="text-[#AC9592] hover:text-[#8B7355] transition-colors text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 저장하기 버튼 */}
      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={isLoading || addContentMutation.isPending || selectedPoses.length === 0}
          className="w-full py-3 rounded-lg text-white text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: (isLoading || addContentMutation.isPending) ? '#8C7A7A' : '#A08B8B',
            fontFamily: 'Pretendard, sans-serif'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !addContentMutation.isPending && selectedPoses.length > 0) {
              e.currentTarget.style.backgroundColor = '#8C7A7A'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !addContentMutation.isPending) {
              e.currentTarget.style.backgroundColor = '#A08B8B'
            }
          }}
        >
          {isLoading || addContentMutation.isPending ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
