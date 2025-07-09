import * as React from 'react'
import { useState, useEffect } from 'react'
import SlideMessage from './SlideMessage'

export default function SlideMessageContainer() {
  const [isMessageVisible, setIsMessageVisible] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // 왼쪽으로 스와이프
      setIsMessageVisible(false)
    }
    setTouchStart(0)
    setTouchEnd(0)
  }

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollX > 50) {
        setIsMessageVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <SlideMessage
        message="옆으로 슬라이드 해주세요"
        iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/69427b3c1dc206430fef193c36589a066eda3418ff09f0a80e6805e07838ef6c?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
        isVisible={isMessageVisible}
      />
    </div>
  )
}
