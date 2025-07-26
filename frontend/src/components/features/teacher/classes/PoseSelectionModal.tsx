import React, { useState } from 'react';
import { SlideUpModal } from '@/components/common/SlideUpModal';
import { PoseCard } from './PoseCard';
import { useBalletPoses } from '@/hooks/useBalletPoses';
import { BalletPose } from '@/types/api/ballet-pose';
import { PoseDifficulty } from '@/types/api/ballet-pose';

interface PoseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pose: BalletPose) => void;
  selectedPoseId?: number;
}

export function PoseSelectionModal({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedPoseId 
}: PoseSelectionModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<PoseDifficulty | 'ALL'>('ALL');
  const { data: poses, isLoading, error } = useBalletPoses();

  const difficulties: Array<{ value: PoseDifficulty | 'ALL'; label: string }> = [
    { value: 'ALL', label: '전체' },
    { value: 'BEGINNER', label: '초급' },
    { value: 'INTERMEDIATE', label: '중급' },
    { value: 'ADVANCED', label: '고급' },
  ];

  const filteredPoses = poses?.filter(pose => 
    selectedDifficulty === 'ALL' || pose.difficulty === selectedDifficulty
  ) || [];

  const handlePoseClick = (pose: BalletPose) => {
    onSelect(pose);
    onClose();
  };

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={onClose}
      title="발레 자세 선택"
      contentClassName="pb-6"
    >
      <div className="space-y-4">
        {/* 난이도 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 py-4">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty.value}
              onClick={() => setSelectedDifficulty(difficulty.value)}
              className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedDifficulty === difficulty.value
                  ? 'bg-stone-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {difficulty.label}
            </button>
          ))}
        </div>

        {/* 자세 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-700" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-stone-500">
            발레 자세를 불러올 수 없습니다.
          </div>
        ) : filteredPoses.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            선택한 난이도의 발레 자세가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
            {filteredPoses.map((pose) => (
              <PoseCard
                key={pose.id}
                pose={pose}
                onClick={() => handlePoseClick(pose)}
                isSelected={selectedPoseId === pose.id}
                showAddIcon={true}
              />
            ))}
          </div>
        )}
      </div>
    </SlideUpModal>
  );
} 