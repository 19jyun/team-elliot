export interface StudentClass {
  id: number;
  name: string;
  teacherName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  [key: string]: any;
}

export interface MyClassesResponse extends Array<StudentClass> {}
export interface ClassDetailResponse extends StudentClass {}
export interface EnrollClassResponse {
  success: boolean;
  message: string;
}
export interface UnenrollClassResponse {
  success: boolean;
  message: string;
}
