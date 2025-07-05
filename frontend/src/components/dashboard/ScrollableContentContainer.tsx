'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollableContentContainerProps {
  children: ReactNode;
  activeTab: number;
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
  onTabChange?: (newTab: number) => void;
}

export function ScrollableContentContainer({
  children,
  activeTab,
  isTransitioning,
  onTransitionComplete,
  onTabChange,
}: ScrollableContentContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [xValue, setXValue] = useState(0);

  // transform 값 계산
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const pageWidth = containerWidth / 3; // 3개 페이지이므로 각각 1/3
      const baseOffset = -(activeTab * pageWidth);
      setXValue(baseOffset + dragOffset);
    }
  }, [activeTab, dragOffset]);

  // 터치/스와이프 이벤트 처리
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      setDragOffset(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      
      // 스와이프 방향에 따른 시각적 피드백
      if (Math.abs(diff) > 50) {
        setDragOffset(diff * 0.3);
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = currentX - startX;
      const threshold = 100; // 스와이프 임계값
      
      // 스와이프 방향에 따른 탭 변경
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && activeTab > 0) {
          // 오른쪽으로 스와이프 - 이전 탭
          onTabChange?.(activeTab - 1);
        } else if (diff < 0 && activeTab < 2) {
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
  }, [activeTab, onTabChange]);

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        ref={containerRef}
        className="flex w-full"
        style={{
          width: '300%', // 3개 페이지 (각각 100%씩)
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