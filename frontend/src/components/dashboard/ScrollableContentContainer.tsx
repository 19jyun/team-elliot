'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

interface ScrollableContentContainerProps {
  children: ReactNode;
  activeTab: number;
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
  onTabChange?: (newTab: number) => void;
  enableSwipe?: boolean; // 스와이프 기능 활성화/비활성화 옵션
}

export function ScrollableContentContainer({
  children,
  activeTab,
  isTransitioning,
  onTransitionComplete,
  onTabChange,
  enableSwipe = true, // 기본값은 활성화
}: ScrollableContentContainerProps) {
  const { ui } = useApp();
  const { isDashboardFocused } = ui;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [xValue, setXValue] = useState(0);

  // transform 값 계산
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // 동적으로 페이지 수를 계산 (children의 개수에 따라)
      const pageCount = React.Children.count(children);
      const pageWidth = containerWidth / pageCount;
      const baseOffset = -(activeTab * pageWidth);
      setXValue(baseOffset + dragOffset);
    }
  }, [activeTab, dragOffset, children]);

  // 터치/스와이프 이벤트 처리 (개선된 버전)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 스와이프 기능이 비활성화되어 있으면 이벤트 리스너 등록하지 않음
    if (!enableSwipe) {
      return;
    }

    // 대시보드가 포커스되어 있지 않으면 슬라이드 비활성화
    if (!isDashboardFocused()) {
      return;
    }

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let startTime = 0;
    let isDragging = false;
    let isHorizontalSwipe = false;
    let hasMovedEnough = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      isDragging = true;
      isHorizontalSwipe = false;
      hasMovedEnough = false;
      setDragOffset(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
      
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      
      // 최소 이동 거리 체크 (10px)
      if (distance < 10) return;
      
      // 수평/수직 방향 판단
      const angle = Math.abs(Math.atan2(diffY, diffX) * 180 / Math.PI);
      
      // 수평 스와이프인지 확인 (30도 이내의 각도)
      if (angle < 30 || angle > 150) {
        isHorizontalSwipe = true;
        
        // 충분히 이동했는지 확인 (30px 이상)
        if (Math.abs(diffX) > 30) {
          hasMovedEnough = true;
          
          // 시각적 피드백 제공 (더 부드럽게)
          const offsetRatio = Math.min(Math.abs(diffX) / 100, 1);
          setDragOffset(diffX * offsetRatio * 0.2);
        }
      } else if (angle > 60 && angle < 120) {
        // 수직 스크롤로 판단되면 스와이프 취소
        isHorizontalSwipe = false;
        hasMovedEnough = false;
        setDragOffset(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      const duration = Date.now() - startTime;
      
      // 스와이프 조건 체크
      const isQuickSwipe = duration < 400; // 시간 임계값 완화
      const isLongSwipe = Math.abs(diffX) > 80; // 거리 임계값 완화
      const isHorizontalEnough = Math.abs(diffX) > Math.abs(diffY) * 1.5; // 수평성 체크 강화
      
      // 스와이프 실행 조건
      const shouldSwipe = isHorizontalSwipe && 
                         hasMovedEnough && 
                         (isQuickSwipe || isLongSwipe) && 
                         isHorizontalEnough;
      
      if (shouldSwipe) {
        const pageCount = React.Children.count(children);
        const threshold = 50; // 최소 스와이프 거리
        
        if (diffX > threshold && activeTab > 0) {
          // 오른쪽으로 스와이프 - 이전 탭
          onTabChange?.(activeTab - 1);
        } else if (diffX < -threshold && activeTab < pageCount - 1) {
          // 왼쪽으로 스와이프 - 다음 탭
          onTabChange?.(activeTab + 1);
        }
      }
      
      // 드래그 오프셋 초기화
      setDragOffset(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab, onTabChange, isDashboardFocused, children, enableSwipe]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <motion.div
        ref={containerRef}
        className="flex w-full"
        style={{
          width: `${React.Children.count(children) * 100}%`, // 동적으로 페이지 수에 따라 설정
        }}
        animate={{
          x: xValue,
        }}
        transition={{
          type: 'tween',
          duration: dragOffset === 0 ? 0.3 : 0, // 드래그 중일 때는 즉시 반영
          ease: 'easeInOut',
        }}
        onAnimationComplete={() => {
          if (isTransitioning) {
            onTransitionComplete?.();
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
} 