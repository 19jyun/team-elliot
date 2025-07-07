interface PaymentConfirmFooterProps {
  confirmed: boolean;
  setConfirmed: (v: boolean) => void;
  onComplete: () => void;
  isProcessing: boolean;
}

export function PaymentConfirmFooter({ 
  confirmed, 
  setConfirmed, 
  onComplete, 
  isProcessing 
}: PaymentConfirmFooterProps) {
  return (
    <div className="flex flex-col items-center px-5 pt-2 pb-4 w-full">
        <label className="flex items-center gap-2 text-sm mb-2 py-3">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            style={{ 
              accentColor: confirmed ? '#262626' : '#8C8C8C',
              width: '16px',
              height: '16px'
            }}
            disabled={isProcessing}
          />
          <span style={{ color: confirmed ? '#262626' : '#8C8C8C' }}>
            입금 완료했습니다
          </span>
        </label>
        <button
          className={`flex-1 shrink self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full transition-colors duration-300 text-center font-semibold ${confirmed && !isProcessing ? 'bg-[#AC9592] text-white cursor-pointer' : 'bg-zinc-300 text-white cursor-not-allowed'}`}
          disabled={!confirmed || isProcessing}
          onClick={onComplete}
        >
          {isProcessing ? '처리 중...' : '결제 완료'}
        </button>
      </div>
  );
} 