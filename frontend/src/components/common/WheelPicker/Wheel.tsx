import React, { useRef, useMemo } from "react"
import {
  KeenSliderOptions,
  TrackDetails,
  useKeenSlider,
} from "keen-slider/react"

interface WheelProps {
  initIdx?: number
  label?: string
  length: number
  loop?: boolean
  perspective?: "left" | "right" | "center"
  setValue?: (relative: number, absolute: number) => string
  width: number
  onChange?: (index: number) => void
}

export default function Wheel(props: WheelProps) {
  const { 
    perspective: perspectiveProp = "center",
    length,
    loop,
    setValue,
    width,
    label,
    onChange,
    initIdx
  } = props
  
  const perspective = perspectiveProp
  const wheelSize = 20
  const slides = length
  const slideDegree = 360 / wheelSize
  const slidesPerView = loop ? 9 : 1
  const [sliderState, setSliderState] = React.useState<TrackDetails | null>(
    null
  )
  const size = useRef(0)
  const onChangeRef = useRef(onChange)
  const lastIndexRef = useRef<number | null>(null)

  // onChange ref 업데이트
  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const options = useRef<KeenSliderOptions>({
    slides: {
      number: slides,
      origin: loop ? "center" : "auto",
      perView: slidesPerView,
    },
    vertical: true,
    initial: Math.max(0, Math.min(slides - 1, initIdx || 0)), // initIdx가 유효한 범위 내에 있는지 확인
    loop: loop,
    dragSpeed: (val) => {
      const height = size.current
      return (
        val *
        (height /
          ((height / 2) * Math.tan(slideDegree * (Math.PI / 180))) /
          slidesPerView)
      )
    },
    created: (s) => {
      size.current = s.size
    },
    updated: (s) => {
      size.current = s.size
    },
    detailsChanged: (s) => {
      setSliderState(s.track.details)
    },
    rubberband: !loop,
    mode: "free-snap",
  })

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(options.current)
  const [radius, setRadius] = React.useState(0)

  React.useEffect(() => {
    if (slider.current) setRadius(slider.current.size / 2)
  }, [slider])

  // 현재 선택된 값이 변경될 때만 onChange 호출 (중복 호출 방지)
  React.useEffect(() => {
    if (sliderState && onChangeRef.current) {
      const currentIndex = sliderState.abs % length;
      // 이전 인덱스와 다를 때만 호출
      if (lastIndexRef.current !== currentIndex) {
        lastIndexRef.current = currentIndex;
        onChangeRef.current(currentIndex);
      }
    }
  }, [sliderState, length])

  // slideValues를 useMemo로 최적화
  const slideValues = useMemo(() => {
    // sliderState가 완전히 초기화되지 않았거나 slides 배열이 없는 경우 빈 배열 반환
    if (!sliderState || !sliderState.slides || !Array.isArray(sliderState.slides) || sliderState.slides.length === 0) {
      return []
    }
    
    const offset = loop ? 1 / 2 - 1 / slidesPerView / 2 : 0

    const values = []
    for (let i = 0; i < slides; i++) {
      // 방어적 프로그래밍: slides[i]가 존재하고 distance 프로퍼티가 있는지 확인
      const slide = sliderState.slides[i]
      if (!slide || typeof slide.distance === 'undefined') {
        // slide가 없거나 distance가 없으면 기본값으로 처리
        values.push({ 
          transform: `rotateX(0deg) translateZ(${radius}px)`, 
          value: setValue ? setValue(i, i) : i, 
          isSelected: false 
        })
        continue
      }

      const distance = (slide.distance - offset) * slidesPerView
      const rotate =
        Math.abs(distance) > wheelSize / 2
          ? 180
          : distance * (360 / wheelSize) * -1
      
      // 스타일 객체를 인라인으로 생성하지 않고 문자열로 최적화
      const transform = `rotateX(${rotate}deg) translateZ(${radius}px)`
      
      const value = setValue
        ? setValue(i, sliderState.abs + Math.round(distance))
        : i
      
      // 선택된 슬라이드인지 확인 (중앙에 가까운 슬라이드)
      const isSelected = Math.abs(distance) < 0.5
      
      values.push({ transform, value, isSelected })
    }
    return values
  }, [sliderState, loop, slidesPerView, slides, wheelSize, radius, setValue])

  // sliderState가 완전히 초기화되지 않았으면 로딩 상태 표시
  if (!sliderState || !sliderState.slides || !Array.isArray(sliderState.slides) || sliderState.slides.length === 0) {
    return (
      <div
        className={"wheel keen-slider wheel--perspective-" + perspective}
        ref={sliderRef}
        style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="text-stone-500 text-sm">로딩 중...</div>
      </div>
    )
  }

  return (
    <div
      className={"wheel keen-slider wheel--perspective-" + perspective}
      ref={sliderRef}
    >
      <div
        className="wheel__shadow-top"
        style={{
          transform: `translateZ(${radius}px)`,
          WebkitTransform: `translateZ(${radius}px)`,
        }}
      />
      <div className="wheel__inner">
        <div className="wheel__slides" style={{ width: width + "px" }}>
          {slideValues.map(({ transform, value, isSelected }, idx) => (
            <div 
              className={`wheel__slide ${isSelected ? 'selected' : ''}`} 
              style={{
                transform,
                WebkitTransform: transform,
              }}
              key={idx}
            >
              <span>{value}</span>
            </div>
          ))}
        </div>
        {label && (
          <div
            className="wheel__label"
            style={{
              transform: `translateZ(${radius}px)`,
              WebkitTransform: `translateZ(${radius}px)`,
            }}
          >
            {props.label}
          </div>
        )}
        {/* 선택 영역 표시 */}
        <div 
          className="wheel__selection-indicator"
          style={{
            transform: `translateZ(${radius}px)`,
            WebkitTransform: `translateZ(${radius}px)`,
          }}
        />
      </div>
      <div
        className="wheel__shadow-bottom"
        style={{
          transform: `translateZ(${radius}px)`,
          WebkitTransform: `translateZ(${radius}px)`,
        }}
      />
    </div>
  )
} 