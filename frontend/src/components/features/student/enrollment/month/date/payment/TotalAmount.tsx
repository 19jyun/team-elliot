interface TotalAmountProps {
  amount: number;
}

export function TotalAmount({ amount }: TotalAmountProps) {
  return (
    <div className="flex flex-row justify-between items-start w-full gap-5">
      <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[109px]">
        <span className="flex items-center text-[#31220F] font-normal text-base leading-[19px]">
          수강료
        </span>
      </div>
      <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[226px]">
        <span className="flex items-center text-[#31220F] font-semibold text-base leading-[19px]">
          {amount.toLocaleString()}원
        </span>
      </div>
    </div>
  );
} 