'use client';

import { SlideUpModal } from '@/components/common/SlideUpModal';
import { ClassDetail } from './ClassDetail';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
}

export function ClassDetailModal({ isOpen, onClose, classId }: ClassDetailModalProps) {
  return (
    <SlideUpModal isOpen={isOpen} onClose={onClose} title="클래스 상세 정보">
      <ClassDetail classId={classId} showModificationButton={false} />
    </SlideUpModal>
  );
} 