import React from 'react';
import { BalletPose } from '@/types/api/ballet-pose';

interface PoseCardProps {
  pose: BalletPose;
  onClick?: () => void;
  isSelected?: boolean;
  showAddIcon?: boolean; // + 아이콘 표시 (선택 모달용)
  showDeleteIcon?: boolean; // x 아이콘 표시 (수업 내용용)
  onDeleteClick?: () => void; // 삭제 버튼 클릭 핸들러
  orderNumber?: number; // 순서 번호 (수업 내용용)
}

export function PoseCard({ 
  pose, 
  onClick, 
  isSelected = false, 
  showAddIcon = false,
  showDeleteIcon = false,
  onDeleteClick,
  orderNumber
}: PoseCardProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick?.();
  };

  return (
    <div
      className={`relative p-4 rounded-lg border transition-all duration-200 ${
        showDeleteIcon 
          ? 'bg-white border-gray-200' // 수업 내용용
          : isSelected 
            ? 'border-stone-700 bg-stone-50 shadow-md cursor-pointer' 
            : 'border-gray-200 bg-white hover:border-stone-300 hover:shadow-sm cursor-pointer'
      }`}
      onClick={onClick}
    >
      {/* 자세명과 아이콘 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 순서 번호 */}
          {orderNumber && (
            <span className="text-stone-600 font-medium text-sm">
              {orderNumber}.
            </span>
          )}
          
          <h3 className="font-medium text-stone-700">
            {pose.name}
          </h3>
        </div>
        
        {/* + 아이콘 (선택 모달용) */}
        {showAddIcon && (
          <div className="text-stone-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )}
        
        {/* x 아이콘 (수업 내용용) */}
        {showDeleteIcon && (
          <button
            onClick={handleDeleteClick}
            className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 