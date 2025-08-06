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
    <div className="border rounded-xl p-5 bg-white shadow flex flex-col items-start min-w-[320px] w-full flex-shrink-0 mx-auto text-sm py-5">
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