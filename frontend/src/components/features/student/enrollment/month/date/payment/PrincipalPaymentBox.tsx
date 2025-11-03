import { PrincipalPaymentInfo } from './types';
import { BankInfo } from './BankInfo';
import { ClassFeeList } from './ClassFeeList';
import { TotalAmount } from './TotalAmount';

interface PrincipalPaymentBoxProps {
  principal: PrincipalPaymentInfo;
  onCopy: () => void;
}

export function PrincipalPaymentBox({ principal, onCopy }: PrincipalPaymentBoxProps) {
  return (
    <div className="flex flex-col justify-center items-center bg-white border border-[#D9D9D9] rounded-lg mx-auto py-6 px-4 gap-3 w-full max-w-md">
      <BankInfo 
        bankName={principal.bankName}
        accountNumber={principal.accountNumber}
        accountHolder={principal.accountHolder}
        onCopy={onCopy}
      />
      <ClassFeeList classFees={principal.classFees} />
      <TotalAmount amount={principal.totalAmount} />
    </div>
  );
} 