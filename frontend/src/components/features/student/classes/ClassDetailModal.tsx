'use client';

import { SlideUpModal } from '@/components/common/SlideUpModal';
import { ClassDetail } from './ClassDetail';
import type { ClassDetailModalVM } from '@/types/view/student';

export function ClassDetailModal({ isOpen, onClose, classId }: ClassDetailModalVM) {
  return (
    <SlideUpModal isOpen={isOpen} onClose={onClose} title="클래스 상세 정보">
      <ClassDetail classId={classId} showModificationButton={false} />
    </SlideUpModal>
  );
} 