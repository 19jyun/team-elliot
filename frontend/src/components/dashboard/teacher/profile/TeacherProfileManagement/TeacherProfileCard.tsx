'use client';

import React from 'react';
import { TeacherProfileCard as CommonTeacherProfileCard } from '@/components/common/TeacherProfileCard';

interface TeacherProfileCardProps {
  isEditable?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

export function TeacherProfileCard({ 
  isEditable = true, 
  onSave, 
  onCancel 
}: TeacherProfileCardProps) {
  return (
    <CommonTeacherProfileCard
      isEditable={isEditable}
      onSave={onSave}
      onCancel={onCancel}
      showHeader={true}
      compact={false}
    />
  );
} 