// 학원 관련 이벤트 타입들
export interface AcademyEvent {
  type: 'teacher_joined' | 'teacher_left' | 'student_joined' | 'student_left';
  academyId: number;
  userId: number;
  userType: 'teacher' | 'student';
  timestamp: Date;
}

export interface TeacherAcademyEvent {
  type: 'teacher_joined' | 'teacher_left';
  academyId: number;
  teacherId: number;
  timestamp: Date;
}

export interface StudentAcademyEvent {
  type: 'student_joined' | 'student_left';
  academyId: number;
  studentId: number;
  timestamp: Date;
}
