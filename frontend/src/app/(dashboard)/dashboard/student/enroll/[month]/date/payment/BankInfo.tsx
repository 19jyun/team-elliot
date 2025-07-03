interface BankInfoProps {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  onCopy: () => void;
}

export function BankInfo({ bankName, accountNumber, accountHolder, onCopy }: BankInfoProps) {
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
          onClick={onCopy}
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