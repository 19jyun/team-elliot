'use client';

import React, { ReactNode, useState } from 'react';
import { useDashboardNavigation } from '@/contexts/DashboardContext';
import { ScrollableContentContainer } from './ScrollableContentContainer';
import { DashboardPage } from './DashboardPage';
import { EnrollmentContainer } from './student/Enrollment/EnrollmentContainer';

interface DashboardContainerProps {
  children: ReactNode[];
}

export function DashboardContainer({ children }: DashboardContainerProps) {
  const {
    activeTab,
    isTransitioning,
    subPage,
    handleTabChange,
  } = useDashboardNavigation();

  // 각 페이지의 스크롤 위치를 개별적으로 관리
  const [pageScrollPositions, setPageScrollPositions] = useState<Record<number, number>>({});

  // 스크롤 위치 저장 핸들러
  const handlePageScroll = React.useCallback((tabIndex: number, position: number) => {
    setPageScrollPositions(prev => ({
      ...prev,
      [tabIndex]: position,
    }));
  }, []);

  // 전환 완료 핸들러
  const handleTransitionComplete = React.useCallback(() => {
    // 전환 완료 후 추가 작업이 필요한 경우 여기에 구현
  }, []);

  // 메인 페이지들 렌더링
  return (
    <div className="w-full h-full">
      <ScrollableContentContainer
        activeTab={activeTab}
        isTransitioning={isTransitioning}
        onTransitionComplete={handleTransitionComplete}
        onTabChange={handleTabChange}
      >
        {children.map((child, index) => (
          <DashboardPage
            key={index}
            isActive={index === activeTab}
            onScroll={(position) => handlePageScroll(index, position)}
            initialScrollPosition={pageScrollPositions[index] || 0}
          >
            {child}
          </DashboardPage>
        ))}
      </ScrollableContentContainer>
    </div>
  );
} 