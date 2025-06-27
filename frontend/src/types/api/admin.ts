export interface Student {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  level?: string;
  [key: string]: any;
}

export interface Teacher {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  introduction?: string;
  specialization?: string;
  [key: string]: any;
}

export interface Class {
  id: number;
  name: string;
  description?: string;
  teacherId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  level: string;
  location: string;
  monthlyFee: number;
  backgroundColor?: string;
  [key: string]: any;
}

export interface GetStudentsResponse extends Array<Student> {}
export interface GetTeachersResponse extends Array<Teacher> {}
export interface GetClassesResponse extends Array<Class> {}
export interface GetWithdrawalStatsResponse {
  total: number;
  byReason: { [reason: string]: number };
}

export interface CreateStudentRequest extends Omit<Student, "id"> {}
export interface CreateStudentResponse extends Student {}
export interface CreateTeacherRequest extends Omit<Teacher, "id"> {}
export interface CreateTeacherResponse extends Teacher {}
export interface CreateClassRequest extends Omit<Class, "id"> {}
export interface CreateClassResponse extends Class {}

export interface ResetStudentPasswordRequest {
  newPassword: string;
}
export interface ResetStudentPasswordResponse extends Student {}
