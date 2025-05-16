export interface Student {
  id: number
  name: string
  phoneNumber?: string
  enrollments?: Enrollment[]
}

export interface Teacher {
  id: number
  name: string
  phoneNumber?: string
  introduction?: string
  photoUrl?: string
  classes?: Class[]
}

export interface Class {
  id: number
  className: string
  classCode: string
  description?: string
  maxStudents?: number
  tuitionFee: number
  teacherId: number
  dayOfWeek: string
  time: string
  teacher?: Teacher
  enrollments?: Enrollment[]
}

export interface Enrollment {
  id: number
  studentId: number
  classId: number
  enrollmentDate: string
  student?: Student
  class?: Class
}
