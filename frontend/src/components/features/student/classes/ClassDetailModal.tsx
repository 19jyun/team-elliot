'use client';

import { SlideUpModal } from '@/components/common/SlideUpModal';
import { ClassDetail } from './ClassDetail';
import type { ClassDetailModalVM } from '@/types/view/student';

interface ClassDetailModalProps extends ClassDetailModalVM {}

export function ClassDetailModal({ isOpen, onClose, classId }: ClassDetailModalProps) {
  return (
    <SlideUpModal isOpen={isOpen} onClose={onClose} title="클래스 상세 정보">
      <ClassDetail classId={classId} showModificationButton={false} />
    </SlideUpModal>
  );
} 