interface TotalAmountProps {
  amount: number;
}

export function TotalAmount({ amount }: TotalAmountProps) {
  return (
    <div className="grid grid-cols-4 items-center py-2 font-[Pretendard Variable] text-sm">
      <span className="font-semibold w-24 text-[#595959]">총 결제금액</span>
      <span></span>
      <span></span>
      <span className="font-bold text-[#573B30] justify-self-end text-right">{amount.toLocaleString()}원</span>
    </div>
  );
} 