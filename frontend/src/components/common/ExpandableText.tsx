'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  lineClamp?: number;
  className?: string;
  showButton?: boolean;
  buttonText?: {
    expand?: string;
    collapse?: string;
  };
  buttonClassName?: string;
}

export function ExpandableText({ 
  text, 
  lineClamp = 3, 
  className = '',
  showButton = true,
  buttonText = {
    expand: '더보기',
    collapse: '접기'
  },
  buttonClassName = ''
}: ExpandableTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // 텍스트가 실제로 잘렸는지 확인
    const checkTruncation = () => {
      if (!ref.current) return;
      const truncated = ref.current.scrollHeight > ref.current.clientHeight;
      setIsTruncated(truncated);
    };

    // 초기 확인
    checkTruncation();

    // 리사이즈 시 재확인
    const handleResize = () => {
      checkTruncation();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [text]);

  const handleToggle = () => {
    if (!ref.current || isAnimating) return;

    setIsAnimating(true);

    if (!isExpanded) {
      // 확장
      setIsExpanded(true);
      ref.current.style.maxHeight = `${ref.current.scrollHeight}px`;
      
      // 애니메이션 완료 후 maxHeight 제거
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.maxHeight = 'none';
        }
        setIsAnimating(false);
      }, 300);
    } else {
      // 축소
      const currentHeight = ref.current.scrollHeight;
      ref.current.style.maxHeight = `${currentHeight}px`;
      
      // 강제로 리플로우를 발생시켜 애니메이션 시작
      void ref.current.offsetHeight;
      
      setIsExpanded(false);
      ref.current.style.maxHeight = '0px';
      
      // 애니메이션 완료 후 상태 정리
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.maxHeight = '';
        }
        setIsAnimating(false);
      }, 300);
    }
  };

  const getTextColor = () => {
    // className에서 text 색상 추출하거나 기본값 사용
    if (className.includes('text-')) {
      return className.match(/text-[a-z-]+/)?.[0] || 'text-gray-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="relative">
      <div className="relative">
        <p
          ref={ref}
          onClick={!isExpanded && isTruncated ? handleToggle : undefined}
          className={`text-sm text-gray-600 transition-all duration-300 ease-in-out overflow-hidden ${
            !isExpanded ? `line-clamp-${lineClamp}` : ''
          } ${!isExpanded && isTruncated ? 'cursor-pointer' : ''} ${className}`}
          style={{
            maxHeight: isExpanded ? 'none' : undefined,
          }}
        >
          {text}
        </p>
        
        {/* Fade 효과 오버레이 */}
        {!isExpanded && isTruncated && (
          <div className="absolute bottom-0 right-0 w-16 h-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        )}
      </div>
      
      {showButton && isTruncated && (
        <button
          onClick={handleToggle}
          className={`inline-flex items-center gap-1 text-xs font-medium transition-colors mt-1 ${getTextColor()} hover:opacity-80 ${buttonClassName}`}
        >
          {isExpanded ? (
            <>
              {buttonText.collapse}
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              {buttonText.expand}
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
} 