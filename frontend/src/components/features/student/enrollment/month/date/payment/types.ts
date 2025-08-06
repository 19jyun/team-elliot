import { ClassSession } from "@/types/api/class";

export interface SelectedSession extends ClassSession {
  class?: {
    id: number;
    className: string;
    level: string;
    tuitionFee: string;
    teacher?: {
      id: number;
      name: string;
    };
  };
}

export interface ClassFee {
  name: string;
  count: number;
  price: number;
}

export interface PrincipalPaymentInfo {
  principalId: number;
  principalName: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  classFees: ClassFee[];
  totalAmount: number;
  sessions: SelectedSession[];
}

// 기존 TeacherPaymentInfo를 PrincipalPaymentInfo로 alias
export type TeacherPaymentInfo = PrincipalPaymentInfo;
