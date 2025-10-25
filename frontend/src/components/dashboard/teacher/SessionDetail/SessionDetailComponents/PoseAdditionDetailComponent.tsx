'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { SeparatorInput } from '@/components/ui/separator-input'
import { useBalletPoses } from '@/hooks/useBalletPoses'
import { useSessionContents, useAddSessionContent, useDeleteSessionContent, useReorderSessionContents } from '@/hooks/useSessionContents'
import { BalletPose } from '@/types/api/ballet-pose'
import type { ClassSessionWithCounts } from '@/types/api/class'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface PoseAdditionDetailComponentProps {
  session: ClassSessionWithCounts | null
  onBack: () => void
}

// 드래그 가능한 자세 아이템 컴포넌트
function SortablePoseItem({ 
  pose, 
  index, 
  onRemove,
  isSelected,
  isDragEnabled
}: { 
  pose: BalletPose
  index: number
  onRemove: (poseId: number, index: number) => void
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
  } = useSortable({ id: `${pose.id}-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // 드래그 리스너를 수정하여 버튼 영역에서는 작동하지 않도록 함
  const modifiedListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      // 삭제 버튼 영역에서는 드래그 시작 방지
      const target = e.target as HTMLElement
      if (target.closest('button')) {
        e.stopPropagation()
        return
      }
      // 원래 리스너 호출
      if (listeners?.onPointerDown) {
        listeners.onPointerDown(e)
      }
    },
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div 
        {...attributes}
        {...modifiedListeners}
        className={`flex items-center justify-between p-4 border border-[#AC9592] rounded-lg transition-all duration-200 ${
          isSelected 
            ? 'bg-[#E8F4FD] border-[#3B82F6] shadow-md' 
            : 'bg-[#F5F5F5] hover:bg-[#F0F0F0]'
        } ${isDragEnabled ? 'cursor-move' : 'cursor-pointer'}`}
      >
        <div className="flex items-center">
          <span className="text-[#AC9592] mr-3 font-medium">{index + 1}</span>
          <div className="flex-1">
            <div className="text-[#573B30] font-medium text-lg">{pose.name}</div>
            {pose.description && (
              <div className="text-sm text-[#8B7355] mt-1">{pose.description}</div>
            )}
          </div>
        </div>
        <button
          onClick={() => onRemove(pose.id, index)}
          className="text-[#AC9592] hover:text-[#8B7355] transition-colors text-lg ml-2 p-1 hover:bg-gray-200 rounded"
          title="자세 제거"
        >
          ✕
        </button>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-[#3B82F6] text-white text-xs px-2 py-1 rounded-full">
          드래그 가능
        </div>
      )}
    </div>
  )
}

export function PoseAdditionDetailComponent({ session, onBack }: PoseAdditionDetailComponentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPoses, setSelectedPoses] = useState<BalletPose[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPoseIndex, setSelectedPoseIndex] = useState<number | null>(null)
  const [isDragEnabled, setIsDragEnabled] = useState(false)
  
  const sessionId = session?.id || 0
  
  // 자세 데이터 로드
  const { data: allPoses, isLoading: posesLoading } = useBalletPoses()
  
  // 기존 세션 내용 로드
  const { data: existingContents, isLoading: contentsLoading } = useSessionContents(sessionId)
  
  // 자세 관련 API
  const addContentMutation = useAddSessionContent(sessionId)
  const deleteContentMutation = useDeleteSessionContent(sessionId)
  const reorderContentMutation = useReorderSessionContents(sessionId)

  // 드래그 앤 드롭 센서 설정 (1초 지연 후 활성화)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 1000, // 1초 지연
        tolerance: 5, // 5px 이동 허용
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
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
    } else {
      setSelectedPoses([])
    }
  }, [existingContents])

  // 변경사항 감지
  const hasChanges = useMemo(() => {
    if (!existingContents) return selectedPoses.length > 0
    
    // 기존 자세들과 현재 선택된 자세들 비교
    const existingPoseIds = existingContents.map((content: any) => content.pose.id).sort()
    const selectedPoseIds = selectedPoses.map(pose => pose.id).sort()
    
    // 길이가 다르면 변경사항 있음
    if (existingPoseIds.length !== selectedPoseIds.length) {
      return true
    }
    
    // 각 ID가 다르면 변경사항 있음
    for (let i = 0; i < existingPoseIds.length; i++) {
      if (existingPoseIds[i] !== selectedPoseIds[i]) {
        return true
      }
    }
    
    return false
  }, [existingContents, selectedPoses])

  // 자세 선택 처리 (로컬 상태만 업데이트)
  const handlePoseSelect = (pose: BalletPose) => {
    // 로컬 상태에 추가 (중복 허용)
    setSelectedPoses(prev => [...prev, pose])
  }

  // 자세 제거 처리 (로컬 상태만 업데이트) - 특정 인덱스의 자세 제거
  const handlePoseRemove = (poseId: number, index?: number) => {
    if (index !== undefined) {
      // 특정 인덱스의 자세 제거
      setSelectedPoses(prev => prev.filter((_, i) => i !== index))
    } else {
      // ID로 첫 번째 매칭되는 자세 제거
      setSelectedPoses(prev => {
        const foundIndex = prev.findIndex(pose => pose.id === poseId)
        if (foundIndex !== -1) {
          return prev.filter((_, i) => i !== foundIndex)
        }
        return prev
      })
    }
  }

  // 드래그 시작 처리
  const handleDragStart = (event: any) => {
    const { active } = event
    const index = selectedPoses.findIndex((_, i) => `${selectedPoses[i].id}-${i}` === active.id)
    setSelectedPoseIndex(index)
    setIsDragEnabled(true)
  }

  // 드래그 앤 드롭 처리
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setSelectedPoses((items) => {
        const oldIndex = items.findIndex((_, i) => `${items[i].id}-${i}` === active.id)
        const newIndex = items.findIndex((_, i) => `${items[i].id}-${i}` === over?.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex)
        }
        return items
      })
    }
    setSelectedPoseIndex(null)
    setIsDragEnabled(false)
  }

  // 드래그 취소 처리
  const handleDragCancel = () => {
    setSelectedPoseIndex(null)
    setIsDragEnabled(false)
  }

  // 저장 처리 (선택된 자세들을 일괄로 API에 저장)
  const handleSave = async () => {
    if (!hasChanges) {
      return
    }

    try {
      setIsLoading(true)
      
      // 1. 기존 자세들을 모두 제거
      if (existingContents && existingContents.length > 0) {
        const deletePromises = existingContents.map((content: any) => 
          deleteContentMutation.mutateAsync(content.id)
        )
        await Promise.all(deletePromises)
      }
      
      // 2. 새로 선택된 자세들을 추가
      if (selectedPoses.length > 0) {
        const addPromises = selectedPoses.map((pose) =>
          addContentMutation.mutateAsync({
            poseId: pose.id,
            notes: ''
          })
        )
        await Promise.all(addPromises)
      }
      
      onBack() // 상위 컴포넌트로 돌아가기
    } catch (error) {
      console.error('저장 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white font-pretendard">
      {/* 상단 고정 영역 */}
      <div className="p-4 border-b border-gray-200">
        {/* 세션 요약 표시 */}
        {session?.sessionSummary && session.sessionSummary.trim().length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 border border-[#AC9592] rounded-lg">
            <p className="text-[#573B30] text-sm font-medium">현재 수업내용 요약</p>
            <p className="text-gray-800 text-sm mt-1">{session.sessionSummary}</p>
          </div>
        )}

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
        <div className="h-[30vh] overflow-y-auto mb-4">
          {posesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-[#AC9592]">자세 목록을 불러오는 중...</div>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredPoses.map((pose, index) => {
                return (
                  <div
                    key={pose.id}
                    onClick={() => handlePoseSelect(pose)}
                    className="p-4 cursor-pointer transition-colors bg-white hover:bg-gray-50"
                  >
                    <div className="text-gray-800 font-medium text-lg">{pose.name}</div>
                    {pose.description && (
                      <div className="text-sm text-gray-600 mt-1">{pose.description}</div>
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
          <h3 className="text-lg font-semibold text-[#AC9592] mb-3">현재 수업내용</h3>
          {selectedPoses && selectedPoses.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={selectedPoses.map((_, index) => `${selectedPoses[index].id}-${index}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 h-[30vh] overflow-y-auto">
                  {selectedPoses.map((pose, index) => (
                    <SortablePoseItem
                      key={`${pose.id}-${index}`}
                      pose={pose}
                      index={index}
                      onRemove={handlePoseRemove}
                      isSelected={selectedPoseIndex === index}
                      isDragEnabled={isDragEnabled}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <img 
                src="/images/logo/team-eliot-2.png" 
                alt="자세 추가" 
                className="w-24 h-24 mb-4 opacity-50"
              />
              <p className="text-[#AC9592] text-lg">자세를 추가해보세요!</p>
            </div>
          )}
        </div>

      {/* 하단 고정 저장하기 버튼 */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleSave}
          disabled={isLoading || addContentMutation.isPending || deleteContentMutation.isPending || !hasChanges}
          className="w-full py-3 rounded-lg text-white text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: (isLoading || addContentMutation.isPending || deleteContentMutation.isPending) ? '#8C7A7A' : '#A08B8B',
            fontFamily: 'Pretendard, sans-serif'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !addContentMutation.isPending && !deleteContentMutation.isPending && hasChanges) {
              e.currentTarget.style.backgroundColor = '#8C7A7A'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !addContentMutation.isPending && !deleteContentMutation.isPending) {
              e.currentTarget.style.backgroundColor = '#A08B8B'
            }
          }}
        >
          {isLoading || addContentMutation.isPending || deleteContentMutation.isPending ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
