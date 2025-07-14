import { TeacherPaymentInfo } from './types';
import { BankInfo } from './BankInfo';
import { ClassFeeList } from './ClassFeeList';
import { TotalAmount } from './TotalAmount';

interface TeacherPaymentBoxProps {
  teacher: TeacherPaymentInfo;
  onCopy: () => void;
  mode?: 'enrollment' | 'modification';
  modificationInfo?: {
    changeAmount: number;
    changeType: string;
    netChangeCount: number;
  } | null;
}

export function TeacherPaymentBox({ teacher, onCopy, mode, modificationInfo }: TeacherPaymentBoxProps) {
  return (
    <div className="border rounded-xl p-5 bg-white shadow flex flex-col items-start min-w-[320px] w-full flex-shrink-0 mx-auto text-sm py-5">
      <BankInfo 
        bankName={teacher.bankName}
        accountNumber={teacher.accountNumber}
        accountHolder={teacher.accountHolder}
        onCopy={onCopy}
      />
      <ClassFeeList classFees={teacher.classFees} />
      <TotalAmount amount={teacher.totalAmount} />
    </div>
  );
} 