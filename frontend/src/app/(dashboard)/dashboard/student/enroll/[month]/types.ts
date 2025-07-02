export interface ClassCardProps {
  level: string;
  className: string;
  teacher: string;
  startTime: string;
  endTime: string;
  dayIndex: number;
  startHour: number;
  bgColor: string;
  containerWidth?: string;
  onInfoClick?: () => void;
  selected?: boolean;
  onClick?: () => void;
}

export interface TimeSlotProps {
  hour: string;
}

export interface StatusStepProps {
  icon: string;
  label: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface TeacherInfo {
  name: string;
  education: string[];
  imageUrl: string;
}

export interface LocationInfo {
  name: string;
  station: string;
  distance: string;
  line: string;
  mapImageUrl: string;
}

export interface ClassInfo {
  title: string;
  teacher: string;
  schedule: string;
  description: string;
  dividerImageUrl: string;
  teacher_info: TeacherInfo;
  location: LocationInfo;
}
