// 고유 ID 생성을 위한 카운터
let userIdCounter = 0;

// 짧고 고유한 ID 생성 (영문+숫자, 최대 15자)
function generateShortUniqueId(): string {
  userIdCounter++;
  const timestamp = Date.now().toString(36).slice(-4); // 4자리
  const counter = userIdCounter.toString(36).padStart(2, '0'); // 2자리
  const random = Math.random().toString(36).substr(2, 3); // 3자리
  return `${timestamp}${counter}${random}`; // 총 9자리
}

// 테스트 데이터 팩토리
export const TestDataFactory = {
  // 사용자 데이터
  users: {
    student: (overrides = {}) => {
      const uniqueId = generateShortUniqueId();
      return {
        userId: `st${uniqueId}`, // st + 9자 = 11자
        password: 'Test1234',
        name: '테스트 학생',
        phoneNumber: `010-1234-${String(5000 + userIdCounter).padStart(4, '0')}`,
        role: 'STUDENT' as const,
        ...overrides,
      };
    },

    teacher: (overrides = {}) => {
      const uniqueId = generateShortUniqueId();
      return {
        userId: `tc${uniqueId}`, // tc + 9자 = 11자
        password: 'Test1234',
        name: '테스트 강사',
        phoneNumber: `010-8765-${String(4000 + userIdCounter).padStart(4, '0')}`,
        role: 'TEACHER' as const,
        ...overrides,
      };
    },

    principal: (overrides = {}) => {
      const uniqueId = generateShortUniqueId();
      return {
        userId: `pr${uniqueId}`, // pr + 9자 = 11자
        password: 'Test1234',
        name: '테스트 원장',
        phoneNumber: `010-5555-${String(5000 + userIdCounter).padStart(4, '0')}`,
        role: 'PRINCIPAL' as const,
        ...overrides,
      };
    },
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
  classes: {
    basic: (overrides = {}) => ({
      className: '테스트 발레 클래스',
      level: 'BEGINNER',
      maxStudents: 10,
      tuitionFee: 150000,
      startDate: new Date('2025-02-01'), // 미래 날짜로 변경
      endDate: new Date('2025-02-28'),
      registrationStartDate: new Date('2025-01-15'),
      registrationEndDate: new Date('2025-01-31'),
      description: '기초 발레 수업입니다.',
      dayOfWeek: 'MONDAY',
      startTime: '18:00',
      endTime: '19:30',
      teacherId: undefined, // 테스트에서 동적으로 설정
      academyId: undefined, // 테스트에서 동적으로 설정
      ...overrides,
    }),
  },

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
