export interface CreateClassDto {
  className: string;
  description: string;
  maxStudents: number;
  tuitionFee: number;
  teacherId: number;
  academyId: number;
  dayOfWeek: DayOfWeek;
  level: string;
  startTime: string;
  endTime: string;
  startDate: string; // UTC ISO 문자열
  endDate: string; // UTC ISO 문자열
}

export interface UpdateClassDto extends Partial<CreateClassDto> {}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface EnrollmentDto {
  studentId: number;
  classId: number;
}
