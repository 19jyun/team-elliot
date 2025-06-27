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

export interface ClassDetailsResponse extends Class {}
export interface AllClassesResponse extends Array<Class> {}
export interface CreateClassRequest extends Omit<Class, "id"> {}
export interface CreateClassResponse extends Class {}
export interface UpdateClassRequest extends Partial<Omit<Class, "id">> {}
export interface UpdateClassResponse extends Class {}
export interface EnrollClassRequest {
  studentId: number;
}
export interface EnrollClassResponse {
  success: boolean;
  message: string;
}
export interface UnenrollClassRequest {
  studentId: number;
}
export interface UnenrollClassResponse {
  success: boolean;
  message: string;
}
export interface ClassesByMonthResponse extends Array<Class> {}
