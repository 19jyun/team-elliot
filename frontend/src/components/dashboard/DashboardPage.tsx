'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { EnrollmentContainer } from './student/Enrollment/EnrollmentContainer';
import { EnrollmentSubPageRenderer } from './student/EnrollmentSubPageRenderer';
import { AcademyManagement } from './student/Profile/AcademyManagement';
import { PersonalInfoManagement } from './student/Profile/PersonalInfoManagement';
import { EnrollmentHistory } from './student/Profile/EnrollmentHistory';
import { CancellationHistory } from './student/Profile/CancellationHistory';

interface DashboardPageProps {
  children: ReactNode;
  isActive: boolean;
  onScroll?: (position: number) => void;
  initialScrollPosition?: number;
}

export function DashboardPage({
  children,
  isActive,
  onScroll,
  initialScrollPosition = 0,
}: DashboardPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const { subPage } = useDashboardNavigation();

  // 스크롤 위치 복원
  useEffect(() => {
    if (isActive && pageRef.current && initialScrollPosition > 0) {
      pageRef.current.scrollTop = initialScrollPosition;
    }
  }, [isActive, initialScrollPosition]);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const page = pageRef.current;
    if (!page || !onScroll) return;

    const handleScroll = () => {
      onScroll(page.scrollTop);
    };

    page.addEventListener('scroll', handleScroll, { passive: true });
    return () => page.removeEventListener('scroll', handleScroll);
  }, [onScroll]);

  // SubPage가 있고 현재 페이지가 활성화된 경우 해당 SubPage 렌더링
  if (subPage && isActive) {
    const renderSubPage = () => {
      // 수강 변경 관련 SubPage (modify-*)
      if (subPage.startsWith('modify-')) {
        return <EnrollmentSubPageRenderer page={subPage} />;
      }
      
      // 월별 수강신청 SubPage (enroll-*)
      if (subPage.startsWith('enroll-')) {
        return <EnrollmentSubPageRenderer page={subPage} />;
      }
      
      switch (subPage) {
        case 'enroll':
          return <EnrollmentContainer />;
        case 'academy':
          return <AcademyManagement />;
        case 'personal-info':
          return <PersonalInfoManagement />;
        case 'enrollment-history':
          return <EnrollmentHistory />;
        case 'cancellation-history':
          return <CancellationHistory />;
        default:
          return <EnrollmentContainer />;
      }
    };

    return (
      <div
        ref={pageRef}
        className="w-full h-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {renderSubPage()}
      </div>
    );
  }

  // SubPage가 없고 현재 페이지가 활성화된 경우 children 렌더링
  if (!subPage && isActive) {
    return (
      <div
        ref={pageRef}
        className="w-full h-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    );
  }

  // 비활성화된 페이지는 숨김
  return (
    <div
      ref={pageRef}
      className="w-full h-full overflow-hidden"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
} 