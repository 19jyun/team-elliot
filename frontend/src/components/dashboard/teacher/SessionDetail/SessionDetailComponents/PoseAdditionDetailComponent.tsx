'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { SeparatorInput } from '@/components/ui/separator-input'
import { useBalletPoses } from '@/hooks/useBalletPoses'
import { useSessionContents, useUpdateSessionPoses } from '@/hooks/useSessionContents'
import { BalletPose } from '@/types/api/ballet-pose'
import type { ClassSessionWithCounts } from '@/types/api/class'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'

interface PoseAdditionDetailComponentProps {
  session: ClassSessionWithCounts | null
  onBack: () => void
}

// 드래그 가능한 자세 아이템 컴포넌트 (포즈 ID 리스트 방식)
function SortablePoseItem({ 
  pose, 
  index, 
  onRemove,
  isSelected,
  isDragEnabled
}: { 
  pose: BalletPose
  index: number
  onRemove: (index: number) => void
  isSelected: boolean
  isDragEnabled: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `pose-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div 
        {...attributes}
        {...listeners}
        className={`flex items-center justify-between p-3 border border-[#AC9592] rounded-lg transition-all duration-200 ${
          isSelected 
            ? 'bg-[#AC9592]/10 border-[#AC9592] shadow-md' 
            : 'bg-[#F5F5F5] hover:bg-[#F0F0F0]'
        } ${isDragEnabled ? 'cursor-move touch-action-none' : 'cursor-pointer'}`}
      >
        <div className="flex items-center">
          <span className="text-[#AC9592] mr-2 font-medium text-sm">{index + 1}</span>
          <div className="flex-1">
            <div className="text-[#573B30] font-medium text-base">{pose.name}</div>
          </div>
        </div>
        <button
          onClick={() => onRemove(index)}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-[#AC9592] hover:text-[#8B7355] transition-colors text-sm ml-2 p-1 hover:bg-gray-200 rounded"
          title="자세 제거"
        >
          ✕
        </button>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-[#AC9592] text-white text-xs px-2 py-1 rounded-full">
          드래그 가능
        </div>
      )}
    </div>
  )
}

export function PoseAdditionDetailComponent({ session, onBack }: PoseAdditionDetailComponentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPoseIndex, setSelectedPoseIndex] = useState<number | null>(null)
  const [isDragEnabled, setIsDragEnabled] = useState(false)
  
  const sessionId = session?.id || 0
  
  // 자세 데이터 로드
  const { data: allPoses, isLoading: posesLoading } = useBalletPoses()
  
  // 기존 세션 내용 로드
  const { data: existingContents, isLoading: _contentsLoading } = useSessionContents(sessionId)
  
  // 새로운 API 사용
  const updatePosesMutation = useUpdateSessionPoses(sessionId)
  
  // 최종 상태 관리 (포즈 ID 리스트 방식)
  const [finalPoseIds, setFinalPoseIds] = useState<number[]>([])
  const [finalNotes, setFinalNotes] = useState<string[]>([])

  // 드래그 앤 드롭 센서 설정 (모바일 중심 최적화)
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 짧은 지연으로 빠른 반응
        tolerance: 20, // 터치 떨림 허용 (더 큰 허용 범위)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // 검색된 자세들 필터링
  const filteredPoses = useMemo(() => {
    if (!allPoses || !Array.isArray(allPoses)) return []
    if (!searchQuery.trim()) return allPoses
    
    return allPoses.filter((pose: BalletPose) => 
      pose.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pose.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allPoses, searchQuery])

  // 기존 자세들을 finalPoseIds에 초기화 (포즈 ID 리스트 방식)
  useEffect(() => {
    if (existingContents) {
      const poseIds = existingContents.contents.map(content => content.poseId)
      const notes = existingContents.contents.map(content => content.notes || '')
      setFinalPoseIds(poseIds)
      setFinalNotes(notes)
    } else {
      setFinalPoseIds([])
      setFinalNotes([])
    }
  }, [existingContents])

  // 변경사항 감지 (포즈 ID 리스트 방식)
  const hasChanges = useMemo(() => {
    if (!existingContents) return finalPoseIds.length > 0
    
    const currentPoseIds = existingContents.contents.map(content => content.poseId)
    return JSON.stringify(currentPoseIds) !== JSON.stringify(finalPoseIds)
  }, [existingContents, finalPoseIds])

  // 자세 선택 처리 (포즈 ID 리스트 방식)
  const handlePoseSelect = (pose: BalletPose) => {
    setFinalPoseIds(prev => [...prev, pose.id])
    setFinalNotes(prev => [...prev, ''])
  }

  // 자세 제거 처리 (포즈 ID 리스트 방식)
  const handlePoseRemove = (index: number) => {
    setFinalPoseIds(prev => prev.filter((_, i) => i !== index))
    setFinalNotes(prev => prev.filter((_, i) => i !== index))
  }

  // 드래그 시작 처리
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const index = parseInt(String(active.id).split('-')[1])
    setSelectedPoseIndex(index)
    setIsDragEnabled(true)
  }

  // 드래그 앤 드롭 처리 (포즈 ID 리스트 방식 - 모바일 최적화)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = parseInt(String(active.id).split('-')[1])
      const newIndex = parseInt(String(over?.id).split('-')[1])
      
      setFinalPoseIds(prev => arrayMove(prev, oldIndex, newIndex))
      setFinalNotes(prev => arrayMove(prev, oldIndex, newIndex))
    }
    
    // 약간의 지연 후 상태 해제 (모바일 터치 안정화)
    setTimeout(() => {
      setSelectedPoseIndex(null)
      setIsDragEnabled(false)
    }, 100)
  }

  // 드래그 취소 처리 (모바일 최적화)
  const handleDragCancel = () => {
    // 약간의 지연 후 상태 해제 (모바일 터치 안정화)
    setTimeout(() => {
      setSelectedPoseIndex(null)
      setIsDragEnabled(false)
    }, 100)
  }

  // 저장 처리 (포즈 ID 리스트 방식 - 매우 단순)
  const handleSave = async () => {
    if (!hasChanges) {
      return
    }

    try {
      await updatePosesMutation.mutateAsync({
        poseIds: finalPoseIds,
        notes: finalNotes
      })
      
      onBack() // 상위 컴포넌트로 돌아가기
    } catch (error) {
      console.error('저장 실패:', error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white font-pretendard">
      {/* 상단 고정 영역 */}
      <div className="p-4 border-b border-gray-200">

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
      </div>

      {/* 중간 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 자세 목록 영역 */}
        <div className="h-[55vh] mb-4">
          {posesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-[#AC9592]">자세 목록을 불러오는 중...</div>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredPoses.map((pose: BalletPose, _index: number) => {
                return (
                  <div
                    key={pose.id}
                    onClick={() => handlePoseSelect(pose)}
                    className="p-3 cursor-pointer transition-colors bg-white hover:bg-gray-50 border-b border-gray-100"
                  >
                    <div className="text-gray-800 font-medium text-base">{pose.name}</div>
                    {pose.description && (
                      <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{pose.description}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

              {/* 현재 수업내용 (기존 + 새로 추가된 자세들) */}
            <div className="mb-4 p-4">
              <h3 className="text-lg font-semibold text-[#573B30] mb-3">추가된 수업내용</h3>
              {finalPoseIds && finalPoseIds.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={finalPoseIds.map((_, index) => `pose-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1.5 h-[20vh] overflow-y-auto">
                      {finalPoseIds.map((poseId, index) => {
                        const pose = (allPoses && Array.isArray(allPoses)) 
                          ? allPoses.find((p: BalletPose) => p.id === poseId)
                          : undefined
                        if (!pose) return null
                        
                        return (
                          <SortablePoseItem
                            key={`pose-${index}`}
                            pose={pose}
                            index={index}
                            onRemove={handlePoseRemove}
                            isSelected={selectedPoseIndex === index}
                            isDragEnabled={isDragEnabled}
                          />
                        )
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Image 
                    src="/images/logo/team-eliot-2.png" 
                    alt="자세 추가" 
                    width={96} 
                    height={96} 
                    className="mb-4 opacity-50" 
                  />
                  <p className="text-[#AC9592] text-lg">자세를 추가해보세요!</p>
                </div>
              )}
            </div>

      {/* 하단 고정 저장하기 버튼 */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleSave}
          disabled={updatePosesMutation.isPending || !hasChanges}
          className="w-full py-3 rounded-lg text-white text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: updatePosesMutation.isPending ? '#8C7A7A' : '#A08B8B',
            fontFamily: 'Pretendard, sans-serif'
          }}
          onMouseEnter={(e) => {
            if (!updatePosesMutation.isPending && hasChanges) {
              e.currentTarget.style.backgroundColor = '#8C7A7A'
            }
          }}
          onMouseLeave={(e) => {
            if (!updatePosesMutation.isPending) {
              e.currentTarget.style.backgroundColor = '#A08B8B'
            }
          }}
        >
          {updatePosesMutation.isPending ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
