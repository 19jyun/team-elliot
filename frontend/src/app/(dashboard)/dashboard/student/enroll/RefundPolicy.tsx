import * as React from 'react'
import { PolicySection } from './PolicySection'
import { CheckboxAgreement } from './CheckboxAgreement'
import { Button } from './Button'
import { policyData } from './data'
import { useDashboardNavigation } from '@/contexts/DashboardContext'

interface RefundPolicyProps {
  isOpen: boolean
  onClose: () => void
  onAgree?: () => void
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ isOpen, onClose, onAgree }) => {
  const [isBottom, setIsBottom] = React.useState(false)
  const [isChecked, setIsChecked] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const { goBack } = useDashboardNavigation()

  // 모달이 열릴 때 애니메이션 시작
  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight,
      ) < 1
    setIsBottom(isAtBottom)
  }

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked)
  }

  const handleButtonClick = () => {
    if (!isBottom) {
      scrollToBottom()
    } else {
      if (isChecked) {
        // 동의하고 수강신청 진행 - RefundPolicy를 닫음
        localStorage.setItem('refundPolicyAgreed', 'true')
        handleClose()
      } else {
        // 체크하지 않고 닫기
        handleClose()
      }
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    // 애니메이션 완료 후에만 onClose 호출
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setIsVisible(false)
    }, 300) // 애니메이션 시간과 동일
  }

  const handleXButtonClick = () => {
    setIsClosing(true)
    // 애니메이션 완료 후에만 goBack 호출
    setTimeout(() => {
      goBack()
      setIsClosing(false)
      setIsVisible(false)
    }, 300) // 애니메이션 시간과 동일
  }

  return (
    <div className={`w-full h-full transition-opacity duration-300 ${
      isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="flex flex-col w-full bg-white h-full">
        <div className="flex flex-col w-full bg-stone-900 bg-opacity-30 h-full">
          <div 
            className={`flex flex-col w-full bg-white rounded-3xl h-full transform transition-transform duration-300 ease-out ${
              isClosing ? 'translate-y-full' : isVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Fixed Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-5 pt-3 pb-4 relative">
              <div className="w-11" /> {/* 왼쪽 여백 고정 */}
              <div className="flex-1 flex justify-center px-4">
                <h1 className="text-base font-semibold tracking-normal leading-snug text-stone-900 text-center">
                  수강신청 및 환불 동의
                </h1>
              </div>
              <div className="w-11 flex justify-end">
                <button
                  onClick={handleXButtonClick}
                  className="p-2 text-stone-500 hover:text-stone-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Scrollable Content Section */}
            <main className="flex-1 min-h-0 bg-white px-5">
              <div
                ref={contentRef}
                onScroll={handleScroll}
                className="w-full overflow-y-auto"
                style={{ 
                  height: 'calc(100vh - 370px)',
                  minHeight: 0 
                }}
              >
                <div className="flex flex-col w-full text-base tracking-normal text-neutral-800">
                  {policyData.sections.map((section, index) => (
                    <PolicySection
                      key={index}
                      title={section.title}
                      content={section.content}
                    />
                  ))}
                </div>
              </div>
            </main>

            {/* Fixed Footer */}
            <footer className="flex-shrink-0 flex flex-col w-full bg-white min-h-[100px]">
              <div className="flex justify-center px-5 py-4 w-full">
                <CheckboxAgreement
                  text="신규회원 필수 안내를 확인했어요"
                  iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/66313034980cffa3f625feffeeea01d71c26e87d2cf3d99975ffeefe94e017d6"
                  onChange={handleCheckboxChange}
                />
              </div>
              <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
                <Button
                  text={isBottom ? '수강신청 하러 가기' : '아래로 내리기'}
                  onClick={handleButtonClick}
                  disabled={isBottom ? !isChecked : false}
                  className={
                    isBottom && isChecked ? 'bg-[#AC9592]' : 'bg-zinc-300'
                  }
                />
              </div>
              <div className="flex flex-col items-center px-20 pt-5 pb-2 w-full max-sm:hidden">
                <div className="flex shrink-0 bg-black h-[5px] rounded-[100px] w-[134px]" />
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
