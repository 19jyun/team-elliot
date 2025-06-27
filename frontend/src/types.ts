export interface Class {
  id: number;
  name: string;
  teacherId: number;
  teacherName: string;
  schedule: string;
  level: string;
  maxStudents: number;
  currentStudents: number;
}

export interface Student {
  id: number;
  userId: string;
  name: string;
  role: string;
}

export interface Teacher {
  id: number;
  userId: string;
  name: string;
  role: string;
}
