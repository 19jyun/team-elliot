import * as React from 'react'

interface Props {
  selectedCount: number
  onSelectAll?: () => void
  onDeselectAll?: () => void
  isAllSelected?: boolean
  onGoToPayment?: () => void
  mode?: 'enrollment' | 'modification';
  // 수강 변경 모드에서 사용할 props
  netChangeCount?: number; // 변경된 강의 개수 (양수: 추가, 음수: 취소)
}

export default function DateSelectFooter({ 
  selectedCount, 
  onSelectAll, 
  onDeselectAll, 
  isAllSelected, 
  onGoToPayment, 
  mode = 'enrollment',
  netChangeCount = 0
}: Props) {
  // 전체선택 체크박스 클릭 핸들러
  const handleSelectAllChange = (checked: boolean) => {
    if (checked && onSelectAll) {
      onSelectAll()
    } else if (!checked && onDeselectAll) {
      onDeselectAll()
    }
  }

  const isModificationMode = mode === 'modification';
  
  // 수강 변경 모드에서 동적 버튼 텍스트 생성
  let buttonText = '수강일자 선택';
  let changeCountDisplay = '';
  
  if (isModificationMode) {
    if (netChangeCount >= 0) {
      buttonText = '추가 금액 결제';
      changeCountDisplay = netChangeCount > 0 ? `${netChangeCount}` : '0';
    } else {
      buttonText = '환불 정보 입력';
      changeCountDisplay = `${Math.abs(netChangeCount)}`;
    }
  }

  return (
    <footer className="sticky bottom-0 flex flex-col w-full bg-white z-50">
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
      <div className="flex gap-3 justify-center px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug text-white">
        <button
          className={`flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center ${selectedCount > 0 ? 'bg-[#AC9592] text-white cursor-pointer' : 'bg-zinc-300 text-white cursor-not-allowed'}`}
          disabled={selectedCount === 0}
          onClick={selectedCount > 0 && onGoToPayment ? onGoToPayment : undefined}
        >
          {selectedCount > 0 ? (
            <span className="inline-flex items-center justify-center w-full">
              {buttonText}
              <span className="ml-2 bg-white text-[#AC9592] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold p-0 aspect-square">
                {isModificationMode ? changeCountDisplay : selectedCount}
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