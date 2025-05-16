export interface CreateClassDto {
  name: string;
  description: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  maxStudents: number;
  teacherId: number;
}

export interface UpdateClassDto extends Partial<CreateClassDto> {}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface EnrollmentDto {
  studentId: number;
  classId: number;
}
