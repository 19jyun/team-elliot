// 테스트 데이터 팩토리
export const TestDataFactory = {
  // 사용자 데이터
  users: {
    student: (overrides = {}) => ({
      userId: `student${Date.now().toString().slice(-6)}`,
      password: 'Test1234',
      name: '테스트 학생',
      phoneNumber: '010-1234-5678',
      role: 'STUDENT' as const,
      ...overrides,
    }),

    teacher: (overrides = {}) => ({
      userId: `teacher${Date.now().toString().slice(-6)}`,
      password: 'Test1234',
      name: '테스트 강사',
      phoneNumber: '010-8765-4321',
      role: 'TEACHER' as const,
      ...overrides,
    }),

    principal: (overrides = {}) => ({
      userId: `principal${Date.now().toString().slice(-6)}`,
      password: 'Test1234',
      name: '테스트 원장',
      phoneNumber: '010-5555-5555',
      role: 'PRINCIPAL' as const,
      ...overrides,
    }),
  },

  // 학원 데이터
  academy: (overrides = {}) => ({
    name: '테스트 발레 학원',
    phoneNumber: '02-1234-5678',
    address: '서울시 강남구 테스트로 123',
    description: '전문적인 발레 교육을 제공합니다.',
    code: `ACADEMY_${Date.now()}`,
    ...overrides,
  }),

  // 클래스 데이터
  class: (overrides = {}) => ({
    name: '초급 발레 클래스',
    description: '초급자를 위한 발레 클래스입니다.',
    maxStudents: 15,
    currentStudents: 0,
    price: 150000,
    backgroundColor: '#FF6B6B',
    startTime: '10:00',
    endTime: '11:30',
    ...overrides,
  }),

  // 환불 신청 데이터
  refundRequest: (overrides = {}) => ({
    reason: '개인 사정으로 인한 수강 중단',
    bankName: '신한은행',
    accountNumber: '110-123-456789',
    accountHolder: '홍길동',
    ...overrides,
  }),

  // 발레 자세 데이터
  balletPose: (overrides = {}) => ({
    name: '플리에',
    description: '기본 발레 동작',
    difficulty: 'BEGINNER' as const,
    imageUrl: 'https://example.com/pose1.jpg',
    ...overrides,
  }),
};

// 테스트 헬퍼 함수들
export class TestHelpers {
  // 고유 ID 생성
  static generateUniqueId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 날짜 생성 헬퍼
  static getFutureDate(days: number = 7): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  // 과거 날짜 생성 헬퍼
  static getPastDate(days: number = 7): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  // 시간 문자열 생성 헬퍼
  static formatTime(hours: number, minutes: number = 0): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
