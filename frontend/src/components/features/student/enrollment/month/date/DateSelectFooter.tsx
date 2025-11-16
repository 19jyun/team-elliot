import * as React from 'react'

interface Props {
  selectedCount: number
  onSelectAll?: () => void
  onDeselectAll?: () => void
  isAllSelected?: boolean
  onGoToPayment?: () => void
  mode?: 'enrollment' | 'modification';
  netChange?: number;
  hasChanges?: boolean; // 수강 변경에서 실제 변경 사항이 있는지 여부
  changeType?: 'additional_payment' | 'refund' | 'no_change'; // 수강 변경 타입
}

export default function DateSelectFooter({ 
  selectedCount, 
  onSelectAll, 
  onDeselectAll, 
  isAllSelected, 
  onGoToPayment,
  mode = 'enrollment',
  netChange = 0,
  hasChanges = false,
  changeType = 'no_change'
}: Props) {
  // 전체선택 체크박스 클릭 핸들러
  const handleSelectAllChange = (checked: boolean) => {
    if (checked && onSelectAll) {
      onSelectAll()
    } else if (!checked && onDeselectAll) {
      onDeselectAll()
    }
  }

  let buttonText = '수강일자 선택';
  let changeCountDisplay = selectedCount;
  let isButtonEnabled = selectedCount > 0;

  if (mode === 'modification') {
    // changeType에 따라 버튼 텍스트 결정 (Container 로직과 일치)
    if (changeType === 'additional_payment') {
      buttonText = '추가 금액 결제';
      changeCountDisplay = Math.abs(netChange);
    } else if (changeType === 'refund') {
      buttonText = '환불 정보 입력';
      changeCountDisplay = Math.abs(netChange);
    } else {
      // no_change인 경우에도 실제 변경이 있으면 payment로 이동
      buttonText = hasChanges ? '변경 확인' : '수강 변경';
      changeCountDisplay = Math.abs(netChange);
    }
    // 수강 변경 모드에서는 실제 변경 사항이 있는 경우 버튼 활성화
    isButtonEnabled = hasChanges;
  }

  return (
    <footer className="sticky bottom-0 flex flex-col w-full bg-white z-50">
      {/* 전체선택은 enrollment 모드에서만 표시 */}
      {mode === 'enrollment' && (
        <div className="flex justify-center items-center px-5 pt-2 pb-2 w-full">
          <label className="flex items-center gap-2 text-sm" style={{ color: isAllSelected ? '#262626' : '#8C8C8C' }}>
            <input 
              type="checkbox" 
              checked={isAllSelected || false}
              onChange={(e) => handleSelectAllChange(e.target.checked)}
              style={{ accentColor: isAllSelected ? '#262626' : '#8C8C8C' }}
            /> 
            전체선택
          </label>
        </div>
      )}
      <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
        <button
          className={`flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center ${isButtonEnabled ? 'bg-[#AC9592] text-white cursor-pointer' : 'bg-zinc-300 text-white cursor-not-allowed'}`}
          disabled={!isButtonEnabled}
          onClick={isButtonEnabled && onGoToPayment ? onGoToPayment : undefined}
        >
          {isButtonEnabled ? (
            <span className="inline-flex items-center justify-center w-full">
              {buttonText}
              <span className="ml-2 bg-white text-[#AC9592] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold p-0 aspect-square">
                {changeCountDisplay}
              </span>
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </footer>
  )
} 