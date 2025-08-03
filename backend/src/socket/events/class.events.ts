// 클래스 관련 이벤트 타입들
export interface ClassEvent {
  type: 'class_created' | 'class_status_changed' | 'session_content_updated';
  classId: number;
  academyId: number;
  teacherId?: number;
  sessionId?: number;
  timestamp: Date;
}

export interface SessionContentEvent {
  type: 'session_content_updated';
  sessionId: number;
  classId: number;
  academyId: number;
  contentId?: number;
  poseId?: number;
  timestamp: Date;
}
