// 단순화된 범용 소켓 이벤트 타입
export interface UpdateRequiredEvent {
  type: 'update_required';
  sourceEvent: string; // 어떤 이벤트에서 발생했는지 추적용
  affectedUsers: {
    userId: number;
    userRole: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
  }[];
  timestamp: Date;
  message?: string; // 선택적 메시지
}

// 기존 이벤트 타입들을 호환성을 위해 유지 (점진적 마이그레이션용)
export interface LegacySocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}
