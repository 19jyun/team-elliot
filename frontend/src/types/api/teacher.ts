export interface TeacherProfile {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  introduction?: string;
  specialization?: string;
  photoUrl?: string;
  [key: string]: any;
}

export interface TeacherProfileResponse extends TeacherProfile {}
export interface UpdateProfileRequest {
  introduction?: string;
  photo?: File;
}
export interface UpdateProfileResponse extends TeacherProfile {}
export interface TeacherClassesResponse
  extends Array<{
    id: number;
    name: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    location: string;
    [key: string]: any;
  }> {}
