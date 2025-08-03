'use client';

import React from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { EnrollmentContainer } from './enroll/EnrollmentContainer';
import { EnrollmentModificationContainer } from './modify/EnrollmentModificationContainer';
interface EnrollmentSubPageRendererProps {
  page: string;
}

export function EnrollmentSubPageRenderer({ page }: EnrollmentSubPageRendererProps) {
  const { goBack } = useDashboardNavigation();


  // 페이지 파싱
  // "enroll" -> 새로운 수강신청 플로우
  // "modify-123" -> 수강 변경 (classId: 123)
  // "modify-123-8" -> 수강 변경 (classId: 123, month: 8)
  
  if (page === 'enroll') {
    return <EnrollmentContainer />;
  }
  
  const isModification = page.startsWith('modify-');
  
  if (isModification) {
    const parts = page.replace('modify-', '').split('-');
    const classId = parseInt(parts[0]);
    const month = parts.length > 1 ? parseInt(parts[1]) : null;
    return <EnrollmentModificationContainer classId={classId} month={month} />;
  }

  // 기존 수강신청 (enroll-8 형태)
  const month = parseInt(page.replace('enroll-', ''));
  return <EnrollmentContainer />;
} 