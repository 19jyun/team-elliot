'use client';

import React from 'react';

import { EnrollmentContainer } from './enroll/EnrollmentContainer';
import { EnrollmentModificationContainer } from './modify/EnrollmentModificationContainer';
interface EnrollmentSubPageRendererProps {
  page: string;
}

export function EnrollmentSubPageRenderer({ page }: EnrollmentSubPageRendererProps) {

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
  return <EnrollmentContainer />;
} 