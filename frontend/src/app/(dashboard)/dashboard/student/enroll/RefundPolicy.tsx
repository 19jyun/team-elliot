import * as React from 'react'
import { useRouter } from 'next/navigation'
import { PolicySection } from './PolicySection'
import { CheckboxAgreement } from './CheckboxAgreement'
import { Button } from './Button'
import { policyData } from './data'

interface RefundPolicyProps {
  onClose: () => void
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ onClose }) => {
  const router = useRouter()
  const [isBottom, setIsBottom] = React.useState(false)
  const [isChecked, setIsChecked] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

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
      const pathSegments = window.location.pathname.split('/')
      const month = pathSegments[pathSegments.length - 1]
      onClose()
      router.push(`/dashboard/student/enroll/${month}`)
    }
  }

  const handleClose = () => {
    onClose()
    router.push('/dashboard/student/enroll')
  }

  return (
    <div className="flex overflow-hidden flex-col mx-auto w-full bg-white max-w-[480px]">
      <div className="flex flex-col pt-28 w-full bg-stone-900 bg-opacity-30">
        <div className="flex overflow-hidden flex-col pt-3 w-full bg-white rounded-3xl">
          <div className="flex gap-10 justify-between items-center mx-3 w-full max-w-[351px]">
            <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11">
              <div className="flex self-stretch my-auto w-6 min-h-[24px]" />
            </div>
            <div className="self-stretch my-auto text-base font-semibold tracking-normal leading-snug text-stone-900">
              수강신청 및 환불 동의
            </div>
            <button
              onClick={handleClose}
              className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11"
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/fe9a4c3193af702e512714b9c88add0dce483b94eca334dd0e070154c9fc10a9"
                alt="Close"
                className="object-contain self-stretch my-auto w-6 aspect-square"
              />
            </button>
          </div>
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="flex z-10 flex-col w-full text-base tracking-normal text-neutral-800 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex flex-col px-5 w-full">
              {policyData.sections.map((section, index) => (
                <PolicySection
                  key={index}
                  title={section.title}
                  content={section.content}
                />
              ))}
            </div>
          </div>
          <CheckboxAgreement
            text="신규회원 필수 안내를 확인했어요"
            iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/66313034980cffa3f625feffeeea01d71c26e87d2cf3d99975ffeefe94e017d6"
            onChange={handleCheckboxChange}
          />
          <div className="flex z-10 flex-col mt-6 w-full">
            <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full bg-white">
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
          </div>
        </div>
      </div>
    </div>
  )
}
