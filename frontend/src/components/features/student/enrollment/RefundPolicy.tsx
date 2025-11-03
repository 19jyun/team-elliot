import * as React from 'react'
import { PolicySection } from './PolicySection'
import { CheckboxAgreement } from './CheckboxAgreement'
import { Button } from './Button'
import { policyData } from './data'
import type { PolicySectionData } from '@/types/ui/common'
import { useApp } from '@/contexts/AppContext'
import { SlideUpModal } from '@/components/common/SlideUpModal'

interface RefundPolicyProps {
  isOpen: boolean
  onClose: () => void
  onAgree?: () => void
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ isOpen, onClose }) => {
  const [isChecked, setIsChecked] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const { goBack } = useApp()

  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked)
  }

  const handleButtonClick = async () => {
    if (isChecked) {
      // 동의하고 수강신청 진행 - RefundPolicy를 닫음
      const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
      SyncStorage.setItem('refundPolicyAgreed', 'true')
      onClose()
    }
  }

  const handleXButtonClick = async () => {
    // X버튼으로 닫을 때는 동의하지 않은 것으로 간주하여 환불 동의 상태 초기화
    const { SyncStorage } = await import('@/lib/storage/StorageAdapter');
    SyncStorage.removeItem('refundPolicyAgreed')
    // SubPage를 닫음
    goBack()
  }

  return (
    <SlideUpModal
      isOpen={isOpen}
      onClose={handleXButtonClick}
      title="수강신청 및 환불 동의"
      onCloseButtonClick={handleXButtonClick}
      className="w-full h-full"
    >
      <div className="flex flex-col h-full">
        {/* Scrollable Content Section */}
        <main className="flex-1 min-h-0 bg-white px-5">
          <div
            ref={contentRef}
            className="w-full overflow-y-auto"
            style={{ 
              height: 'calc(90vh - 250px)',
            }}
          >
            <div className="flex flex-col w-full text-base tracking-normal text-neutral-800">
              {policyData.sections.map((section: PolicySectionData, index: number) => (
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
        <footer className="flex-shrink-0 flex flex-col w-full bg-white">
          <div className="flex justify-center px-5 py-2 w-full">
            <CheckboxAgreement
              text="신규회원 필수 안내를 확인했어요"
              onChange={handleCheckboxChange}
            />
          </div>
          <div className="flex gap-3 justify-center px-5 pt-1 pb-4 w-full text-base font-semibold leading-snug text-white">
            <Button
              text="수강신청 하러 가기"
              onClick={handleButtonClick}
              disabled={!isChecked}
              className={isChecked ? 'bg-[#AC9592]' : 'bg-zinc-300'}
            />
          </div>
          <div className="flex flex-col items-center px-20 pt-2 pb-3 w-full max-sm:hidden">
            <div className="flex shrink-0 bg-black h-[5px] rounded-[100px] w-[134px]" />
          </div>
        </footer>
      </div>
    </SlideUpModal>
  )
}
