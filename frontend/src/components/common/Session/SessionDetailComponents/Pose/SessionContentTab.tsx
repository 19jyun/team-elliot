import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PoseCard } from './PoseCard';
import { useSessionContents, useDeleteSessionContent, useReorderSessionContents } from '@/hooks/useSessionContents';
import { SessionContent } from '@/types/api/session-content';

interface SessionContentTabProps {
  sessionId: number;
  onAddPoseClick?: () => void;
}

// 드래그 가능한 아이템 컴포넌트
function SortableItem({ content, index, isEditMode, onDeleteClick }: {
  content: SessionContent;
  index: number;
  isEditMode: boolean;
  onDeleteClick: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 드래그 리스너를 수정하여 버튼 영역에서는 작동하지 않도록 함
  const modifiedListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      // 삭제 버튼 영역에서는 드래그 시작 방지
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        e.stopPropagation();
        return;
      }
      // 원래 리스너 호출
      if (listeners?.onPointerDown) {
        listeners.onPointerDown(e);
      }
    },
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* 자세 카드 - 드래그 가능한 영역 */}
      <div 
        {...attributes}
        {...modifiedListeners}
        className="cursor-move"
      >
        <PoseCard
          pose={content.pose}
          showDeleteIcon={true}
          onDeleteClick={() => onDeleteClick(content.id)}
          orderNumber={index + 1}
        />
      </div>

      {/* 노트가 있는 경우 */}
      {content.notes && (
        <div className="mt-2 ml-10 bg-stone-50 p-3 rounded-lg text-sm text-stone-600">
          <span className="font-medium">노트:</span> {content.notes}
        </div>
      )}
    </div>
  );
}

export function SessionContentTab({ sessionId, onAddPoseClick }: SessionContentTabProps) {
  const { data: contents, isLoading } = useSessionContents(sessionId);
  const deleteContentMutation = useDeleteSessionContent(sessionId);
  const reorderMutation = useReorderSessionContents(sessionId);
  
  // 최종 상태만 관리 (삭제 + 순서 변경이 모두 반영된 상태)
  const [finalContents, setFinalContents] = useState<SessionContent[]>([]);
  // 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 변경사항이 있는지 확인 (원본과 최종 상태 비교) - useMemo로 최적화
  const hasChanges = useMemo(() => {
    if (!contents || !finalContents) return false;
    
    // 1. 길이가 다르면 변경사항 있음 (삭제된 경우)
    if (finalContents.length !== contents.length) {
      return true;
    }
    
    // 2. 순서가 다르면 변경사항 있음
    for (let i = 0; i < finalContents.length; i++) {
      if (finalContents[i].id !== contents[i].id) {
        return true;
      }
    }
    
    // 3. 모든 항목이 동일한 순서로 있으면 변경사항 없음
    return false;
  }, [contents, finalContents]);

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 초기 상태 설정
  React.useEffect(() => {
    if (contents) {
      setFinalContents([...contents]);
      // 새로운 데이터가 로드되면 편집 모드 초기화
      setIsEditMode(false);
    }
  }, [contents]);

  // 편집 모드 자동 시작 (변경사항이 있을 때)
  React.useEffect(() => {
    if (hasChanges) {
      setIsEditMode(true);
    } else {
      // 변경사항이 없어지면 편집 모드 종료
      setIsEditMode(false);
    }
  }, [hasChanges]);

  // 삭제 처리 (X 버튼 클릭 시)
  const handleDelete = (contentId: number) => {
    setFinalContents(prev => {
      const filtered = prev.filter(item => item.id !== contentId);
      return filtered;
    });
    // setIsEditMode(true); // 제거 - hasChanges useEffect에서 처리
  };

  // 드래그 앤 드롭 처리
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFinalContents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        return newOrder;
      });
      // setIsEditMode(true); // 제거 - hasChanges useEffect에서 처리
    }
  };

  // 변경사항 적용 (최종 상태를 서버에 전송)
  const applyChanges = async () => {
    try {
      
      if (!contents) return;

      // 1. 삭제된 항목들을 찾아서 개별 삭제
      const deletedContentIds = contents
        .filter(content => !finalContents.some(final => final.id === content.id))
        .map(content => content.id);


      // 삭제된 항목들을 개별적으로 삭제
      for (const contentId of deletedContentIds) {
        await deleteContentMutation.mutateAsync(contentId);
      }

      // 2. 순서 변경 처리 (삭제 후 남은 항목들)
      if (finalContents.length > 0) {
        const contentIds = finalContents.map(content => content.id.toString());
        
        await reorderMutation.mutateAsync({ contentIds });
      }

      // 편집 모드 종료
      setIsEditMode(false);
    } catch (error) {
      console.error('변경사항 적용 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-700">수업 내용</h3>
        <div className="flex items-center gap-2">
          {/* 변경 버튼 - 편집 모드일 때만 표시 */}
          {isEditMode && (
            <button
              onClick={applyChanges}
              className="px-4 py-2 bg-[#ac9592] text-white rounded-lg hover:bg-[#9a8582] transition-colors text-sm font-bold"
            >
              변경
            </button>
          )}
          
          {/* 자세 추가 버튼 */}
          <button
            onClick={onAddPoseClick}
            className="px-4 py-2 bg-[#ac9592] text-white rounded-lg hover:bg-[#9a8582] transition-colors text-sm font-bold"
          >
            자세 추가
          </button>
        </div>
      </div>

      {/* 자세 목록 */}
      {finalContents && finalContents.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={finalContents.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {finalContents.map((content, index) => (
                <SortableItem
                  key={content.id}
                  content={content}
                  index={index}
                  isEditMode={isEditMode}
                  onDeleteClick={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center justify-center py-8 flex-1">
            <Image
              src="/images/logo/team-eliot-2.png"
              alt="수업 내용 없음"
              width={120}
              height={120}
            />
            <p className="mt-4 text-stone-500">아직 추가된 발레 자세가 없습니다.</p>
            <p className="text-sm text-stone-400 mt-1">자세 추가 버튼을 눌러 수업 내용을 구성해보세요.</p>
          </div>
        </div>
      )}
    </div>
  );
} 