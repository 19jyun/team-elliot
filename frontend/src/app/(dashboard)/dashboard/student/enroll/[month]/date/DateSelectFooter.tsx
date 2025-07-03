import * as React from 'react'

interface Props {
  selectedCount: number
  onSelectAll?: () => void
  onDeselectAll?: () => void
  isAllSelected?: boolean
  onGoToPayment?: () => void
}

export default function DateSelectFooter({ selectedCount, onSelectAll, onDeselectAll, isAllSelected, onGoToPayment }: Props) {
  // 전체선택 체크박스 클릭 핸들러
  const handleSelectAllChange = (checked: boolean) => {
    if (checked && onSelectAll) {
      onSelectAll()
    } else if (!checked && onDeselectAll) {
      onDeselectAll()
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
              수강일자 선택
              <span className="ml-2 bg-white text-[#AC9592] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold p-0 aspect-square">{selectedCount}</span>
            </span>
          ) : (
            '수강일자 선택'
          )}
        </button>
      </div>
    </footer>
  )
} 