interface BankInfoProps {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  onCopy: () => void;
}

export function BankInfo({ bankName, accountNumber, accountHolder, onCopy }: BankInfoProps) {
  const handleCopyAccountNumber = async () => {
    try {
      // 웹과 모바일 모두 지원하는 클립보드 복사
      if (navigator.clipboard && window.isSecureContext) {
        // HTTPS 환경에서 사용 가능한 최신 API
        await navigator.clipboard.writeText(accountNumber);
      } else {
        // 구형 브라우저나 HTTP 환경을 위한 fallback
        const textArea = document.createElement('textarea');
        textArea.value = accountNumber;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      onCopy(); // 성공 토스트 메시지 표시
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 실패 시에도 사용자에게 알림
      onCopy();
    }
  };

  return (
    <div className="w-full text-sm">
      <div className="flex items-center gap-2 py-2">
        <span className="font-semibold w-20 text-[#595959]">은행명</span>
        <span className="font-bold text-[#573B30]">{bankName}</span>
      </div>
      <div className="flex items-center gap-2 py-2">
        <span className="font-semibold w-20 text-[#595959]">계좌번호</span>
        <span className="tracking-wider font-mono font-bold text-[#573B30]">{accountNumber}</span>
        <button 
          className="flex flex-col justify-center items-center px-2 py-0.5 w-[39px] h-[24px] bg-[#EEE9E7] rounded text-center outline-1 outline-[#573B30] outline-solid"
          onClick={handleCopyAccountNumber}
        >
          <span className="font-[Pretendard Variable] font-semibold text-[13px] leading-[140%] tracking-[-0.01em] w-[30px] h-[18px] flex items-center justify-center ">
            복사
          </span>
        </button>
      </div>
      <div className="flex items-center gap-2 py-2">
        <span className="font-semibold w-20 text-[#595959]">계좌주</span>
        <span className="font-bold text-[#573B30]">{accountHolder}</span>
      </div>
    </div>
  );
} 