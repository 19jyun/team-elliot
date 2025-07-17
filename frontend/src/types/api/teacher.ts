export interface TeacherProfile {
  id: number;
  name: string;
  phoneNumber: string;
  introduction?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  availableTimes?: string[];
  photoUrl?: string;
  academyId?: number;
  academy?: Academy;
  createdAt: string;
  updatedAt: string;
}

export interface Academy {
  id: number;
  name: string;
  code: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  adminId?: number;
  admin?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademyRequest {
  name: string;
  code: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
}

export interface ChangeAcademyRequest {
  code: string;
}

export interface CreateAndJoinAcademyRequest {
  name: string;
  code: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
}

export interface CreateAndJoinAcademyResponse {
  academy: Academy;
  teacher: TeacherProfile;
}

export interface UpdateAcademyRequest {
  name?: string;
  phoneNumber?: string;
  address?: string;
  description?: string;
}

export interface LeaveAcademyResponse {
  message: string;
}

export interface UpdateTeacherProfileRequest {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  availableTimes?: string[];
}

export interface TeacherProfileResponse extends TeacherProfile {}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  introduction?: string;
  education?: string[];
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  availableTimes?: any;
  photo?: File;
}

export interface UpdateProfileResponse extends TeacherProfile {}

export interface TeacherClassesResponse
  extends Array<{
    id: number;
    className: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
    maxStudents: number;
    currentStudents: number;
    level: string;
    tuitionFee: number;
    description?: string;
    backgroundColor?: string;
    location?: string;
    [key: string]: any;
  }> {}

export interface TeacherClass {
  id: number;
  name: string;
  description?: string;
  level: string;
  maxStudents: number;
  fee: number;
  startDate: string;
  endDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  backgroundColor?: string;
  currentStudents: number;
  isRegistrationOpen: boolean;
  teacherId: number;
  academyId: number;
  createdAt: string;
  updatedAt: string;
  sessions?: ClassSession[];
}

export interface ClassSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  classId: number;
  createdAt: string;
  updatedAt: string;
  enrollments?: SessionEnrollment[];
}

export interface TeacherSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  class: {
    id: number;
    className: string;
    maxStudents: number;
    level: string;
    teacher: {
      id: number;
      name: string;
    };
  };
  enrollmentCount: number;
  confirmedCount: number;
}

export interface TeacherSessionsResponse extends Array<TeacherSession> {}

export interface SessionEnrollment {
  id: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "ATTENDED"
    | "ABSENT"
    | "COMPLETED";
  enrolledAt: string;
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
    level?: string;
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    paidAt?: string;
  };
  refundRequests?: Array<{
    id: number;
    reason: string;
    refundAmount: number;
    status: string;
    requestedAt: string;
  }>;
}

export interface SessionEnrollmentsResponse {
  session: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    class: {
      id: number;
      className: string;
      teacher: {
        id: number;
        name: string;
      };
    };
  };
  enrollments: SessionEnrollment[];
  totalCount: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    cancelled: number;
    attended: number;
    absent: number;
    completed: number;
  };
}

export interface UpdateClassDetailsRequest {
  description?: string;
  locationName?: string;
  mapImageUrl?: string;
  requiredItems?: string[];
  curriculum?: string[];
}

export interface UpdateClassDetailsResponse {
  id: number;
  className: string;
  classDetail: {
    id: number;
    description: string;
    locationName: string;
    mapImageUrl: string;
    requiredItems: string[];
    curriculum: string[];
  };
}

export interface TeacherClassesWithSessionsResponse {
  classes: TeacherClassesResponse;
  sessions: TeacherSessionsResponse;
  calendarRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface UpdateEnrollmentStatusRequest {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "ATTENDED"
    | "ABSENT"
    | "COMPLETED";
  reason?: string;
}

export interface UpdateEnrollmentStatusResponse extends SessionEnrollment {}

export interface BatchUpdateEnrollmentStatusRequest {
  enrollmentIds: number[];
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "ATTENDED"
    | "ABSENT"
    | "COMPLETED";
  reason?: string;
}

export interface BatchUpdateEnrollmentStatusResponse {
  success: number;
  total: number;
}
