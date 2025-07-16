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

export interface TeacherPaymentInfo {
  teacherId: number;
  teacherName: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  classFees: ClassFee[];
  totalAmount: number;
  sessions: SelectedSession[];
}
