'use client';

import { ReactNode, useEffect, useRef } from 'react';

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

  return (
    <div
      ref={pageRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden"
      style={{
        width: '100%', // 전체 너비
        minHeight: '100vh',
        scrollBehavior: 'smooth',
      }}
    >
      <div className="w-full max-w-[480px] mx-auto">
        {children}
      </div>
    </div>
  );
} 