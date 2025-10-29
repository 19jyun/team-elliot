import { useClipboard } from '@/hooks/useClipboard';

interface BankInfoProps {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  onCopy: () => void;
}

export function BankInfo({ bankName, accountNumber, accountHolder, onCopy }: BankInfoProps) {
  const { copy } = useClipboard({
    successMessage: "계좌번호가 복사되었습니다",
    onSuccess: () => onCopy(),
  });

  const handleCopyAccountNumber = () => {
    const accountText = `${bankName} ${accountNumber}`;
    copy(accountText);
  };

  return (
    <>
      {/* 은행명 */}
      <div className="flex flex-row justify-between items-start w-full gap-5">
        <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[109px]">
          <span className="flex items-center text-[#31220F] font-normal text-base leading-[19px]">
            은행명
          </span>
        </div>
        <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[226px]">
          <span className="flex items-center text-[#31220F] font-semibold text-base leading-[19px]">
            {bankName}
          </span>
        </div>
      </div>

      {/* 계좌번호 */}
      <div className="flex flex-row justify-between items-start w-full gap-5">
        <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[109px]">
          <span className="flex items-center text-[#31220F] font-normal text-base leading-[19px]">
            계좌번호
          </span>
        </div>
        <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-3 w-[226px]">
          <span className="flex items-center text-[#31220F] font-semibold text-base leading-[19px]">
            {accountNumber}
          </span>
          <button
            onClick={handleCopyAccountNumber}
            className="flex flex-row justify-center items-center px-2 py-0.5 gap-2 w-[50px] h-[23px] border border-[#573B30] rounded-full text-[#573B30] hover:bg-[#573B30] hover:text-white active:bg-[#573B30] active:text-white transition-all duration-200 ease-in-out group"
          >
            <span className="flex items-center font-normal text-[13px] leading-[19px]">
              복사
            </span>
          </button>
        </div>
      </div>

      {/* 계좌주 */}
      <div className="flex flex-row justify-between items-start w-full gap-5">
        <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[109px]">
          <span className="flex items-center text-[#31220F] font-normal text-base leading-[19px]">
            계좌주
          </span>
        </div>
        <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[226px]">
          <span className="flex items-center text-[#31220F] font-semibold text-base leading-[19px]">
            {accountHolder}
          </span>
        </div>
      </div>
    </>
  );
} 