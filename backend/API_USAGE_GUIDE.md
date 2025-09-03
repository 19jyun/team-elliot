# 🚀 Team Elliot API 사용 가이드

프론트엔드 개발자를 위한 Team Elliot Backend API 사용 가이드입니다.

## 📋 목차

1. [인증 및 권한](#인증-및-권한)
2. [API 기본 구조](#api-기본-구조)
3. [주요 API 엔드포인트](#주요-api-엔드포인트)
4. [에러 처리](#에러-처리)
5. [실시간 통신](#실시간-통신)
6. [파일 업로드](#파일-업로드)
7. [사용 예시](#사용-예시)

## 🔐 인증 및 권한

### JWT 토큰 사용

모든 보호된 API는 JWT 토큰이 필요합니다.

```typescript
// 헤더에 토큰 추가
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

// API 호출 예시
const response = await fetch('/api/students/profile', {
  headers,
});
```

### 사용자 역할

- **STUDENT**: 학생 권한
- **TEACHER**: 강사 권한
- **PRINCIPAL**: 원장 권한

## 🏗️ API 기본 구조

### 기본 URL

```
http://localhost:3000/api
```

### 응답 형식

#### 성공 응답

```typescript
{
  id: 1,
  name: "김학생",
  email: "student@example.com",
  // ... 기타 데이터
}
```

#### 에러 응답

```typescript
{
  statusCode: 400,
  message: "잘못된 입력값입니다.",
  code: "INVALID_INPUT",
  details: { field: "name", value: "" }
}
```

### 페이지네이션

```typescript
{
  data: [...],
  meta: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

## 🎯 주요 API 엔드포인트

### 1. 인증 (Auth)

#### 로그인

```typescript
POST /api/auth/login
{
  "userId": "student123",
  "password": "password123"
}
```

#### 회원가입

```typescript
POST /api/auth/signup
{
  "userId": "newstudent",
  "password": "password123",
  "email": "student@example.com",
  "role": "STUDENT",
  "name": "김학생",
  "phoneNumber": "010-1234-5678"
}
```

### 2. 학생 (Student)

#### 내 수업 목록 조회

```typescript
GET / api / students / classes;
Authorization: Bearer<token>;
```

#### 수업 신청

```typescript
POST /api/students/enroll
Authorization: Bearer <token>
{
  "classId": 1
}
```

#### 프로필 수정

```typescript
PUT /api/students/profile
Authorization: Bearer <token>
{
  "name": "김학생",
  "phoneNumber": "010-9876-5432"
}
```

### 3. 강사 (Teacher)

#### 내 수업 목록 조회

```typescript
GET / api / teachers / classes;
Authorization: Bearer<token>;
```

#### 출석 체크

```typescript
PUT /api/teachers/sessions/:sessionId/attendance
Authorization: Bearer <token>
{
  "enrollmentId": 1,
  "status": "ATTENDED"
}
```

### 4. 원장 (Principal)

#### 학원 정보 조회

```typescript
GET / api / principal / academy;
Authorization: Bearer<token>;
```

#### 수업 생성

```typescript
POST /api/principal/classes
Authorization: Bearer <token>
{
  "className": "발레 기초반",
  "teacherId": 1,
  "maxStudents": 15,
  "tuitionFee": 100000,
  "dayOfWeek": "MONDAY",
  "startTime": "14:00",
  "endTime": "15:00"
}
```

### 5. 결제 (Payment)

#### 결제 생성

```typescript
POST /api/payments
Authorization: Bearer <token>
{
  "sessionEnrollmentId": 1,
  "amount": 50000,
  "paymentMethod": "CARD"
}
```

### 6. 환불 (Refund)

#### 환불 요청

```typescript
POST /api/refunds
Authorization: Bearer <token>
{
  "sessionEnrollmentId": 1,
  "reason": "PERSONAL_SCHEDULE",
  "refundAmount": 50000
}
```

## ❌ 에러 처리

### HTTP 상태 코드

- **200**: 성공
- **201**: 생성됨
- **400**: 잘못된 요청
- **401**: 인증 실패
- **403**: 권한 부족
- **404**: 리소스 없음
- **409**: 충돌
- **500**: 서버 오류

### 에러 코드

```typescript
// 주요 에러 코드들
const ERROR_CODES = {
  STUDENT_NOT_FOUND: '학생을 찾을 수 없습니다.',
  CLASS_NOT_FOUND: '수업을 찾을 수 없습니다.',
  SESSION_NOT_FOUND: '세션을 찾을 수 없습니다.',
  INSUFFICIENT_PERMISSIONS: '권한이 부족합니다.',
  SESSION_HAS_ENROLLMENTS: '이미 수강생이 있는 세션입니다.',
  ALREADY_ENROLLED: '이미 수강 신청한 수업입니다.',
  INVALID_ATTENDANCE_STATUS: '잘못된 출석 상태입니다.',
  REFUND_REQUEST_ALREADY_EXISTS: '이미 환불 요청이 존재합니다.',
  ACADEMY_NOT_FOUND: '학원을 찾을 수 없습니다.',
  PRINCIPAL_NOT_FOUND: '원장을 찾을 수 없습니다.',
};
```

### 에러 처리 예시

```typescript
try {
  const response = await fetch('/api/students/enroll', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ classId: 1 }),
  });

  if (!response.ok) {
    const error = await response.json();

    switch (error.code) {
      case 'ALREADY_ENROLLED':
        alert('이미 수강 신청한 수업입니다.');
        break;
      case 'CLASS_NOT_FOUND':
        alert('수업을 찾을 수 없습니다.');
        break;
      default:
        alert(error.message || '오류가 발생했습니다.');
    }
    return;
  }

  const result = await response.json();
  console.log('수강 신청 성공:', result);
} catch (error) {
  console.error('API 호출 오류:', error);
  alert('네트워크 오류가 발생했습니다.');
}
```

## 🔌 실시간 통신

### WebSocket 연결

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token',
  },
});

// 연결 확인
socket.on('connection_confirmed', (data) => {
  console.log('소켓 연결 성공:', data);
});

// 실시간 알림 수신
socket.on('notification', (data) => {
  console.log('새 알림:', data);
});

// 수업 변경 알림
socket.on('class_updated', (data) => {
  console.log('수업 정보 변경:', data);
});
```

### 주요 이벤트

- `connection_confirmed`: 소켓 연결 확인
- `notification`: 일반 알림
- `class_updated`: 수업 정보 변경
- `enrollment_status_changed`: 수강 신청 상태 변경
- `payment_completed`: 결제 완료
- `refund_processed`: 환불 처리 완료

## 📁 파일 업로드

### 이미지 업로드

```typescript
const uploadImage = async (file: File, type: 'profile' | 'ballet-pose') => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`/api/upload/${type}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (response.ok) {
    const result = await response.json();
    return result.imageUrl;
  }

  throw new Error('이미지 업로드 실패');
};
```

### 지원 형식

- **이미지**: JPG, PNG, WEBP
- **최대 크기**: 5MB
- **업로드 경로**: `/uploads/`

## 💡 사용 예시

### 1. 학생 대시보드

```typescript
// 학생 정보 및 수업 목록 조회
const fetchStudentDashboard = async () => {
  try {
    const [profile, classes, payments] = await Promise.all([
      fetch('/api/students/profile', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch('/api/students/classes', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch('/api/students/payments', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const profileData = await profile.json();
    const classesData = await classes.json();
    const paymentsData = await payments.json();

    return {
      profile: profileData,
      classes: classesData,
      payments: paymentsData,
    };
  } catch (error) {
    console.error('대시보드 데이터 조회 실패:', error);
    throw error;
  }
};
```

### 2. 수업 신청 프로세스

```typescript
const enrollInClass = async (classId: number) => {
  try {
    // 1. 수업 정보 조회
    const classResponse = await fetch(`/api/classes/${classId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const classData = await classResponse.json();

    // 2. 수강 신청
    const enrollResponse = await fetch('/api/students/enroll', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ classId }),
    });

    if (!enrollResponse.ok) {
      const error = await enrollResponse.json();
      throw new Error(error.message);
    }

    const enrollment = await enrollResponse.json();

    // 3. 결제 처리
    const paymentResponse = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionEnrollmentId: enrollment.id,
        amount: classData.tuitionFee,
        paymentMethod: 'CARD',
      }),
    });

    const payment = await paymentResponse.json();

    return { enrollment, payment };
  } catch (error) {
    console.error('수업 신청 실패:', error);
    throw error;
  }
};
```

### 3. 실시간 알림 처리

```typescript
const setupNotifications = (socket: any) => {
  // 수강 신청 상태 변경 알림
  socket.on('enrollment_status_changed', (data) => {
    const { enrollmentId, status, message } = data;

    // 상태에 따른 UI 업데이트
    switch (status) {
      case 'CONFIRMED':
        showNotification('수강 신청이 승인되었습니다!', 'success');
        updateEnrollmentStatus(enrollmentId, status);
        break;
      case 'REJECTED':
        showNotification('수강 신청이 거부되었습니다.', 'error');
        updateEnrollmentStatus(enrollmentId, status);
        break;
      case 'CANCELLED':
        showNotification('수강 신청이 취소되었습니다.', 'warning');
        updateEnrollmentStatus(enrollmentId, status);
        break;
    }
  });

  // 결제 완료 알림
  socket.on('payment_completed', (data) => {
    const { paymentId, amount } = data;
    showNotification(
      `결제가 완료되었습니다. (${amount.toLocaleString()}원)`,
      'success',
    );
    updatePaymentStatus(paymentId, 'COMPLETED');
  });
};
```

## 🔧 개발 팁

### 1. 토큰 관리

```typescript
// 토큰 만료 시 자동 갱신
const refreshToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    if (response.ok) {
      const { access_token } = await response.json();
      localStorage.setItem('access_token', access_token);
      return access_token;
    }
  } catch (error) {
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }
};
```

### 2. 에러 바운더리

```typescript
// API 에러를 일관되게 처리
const apiCall = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API 호출 실패');
    }

    return await response.json();
  } catch (error) {
    // 에러 로깅 및 사용자 알림
    console.error('API Error:', error);
    throw error;
  }
};
```

### 3. 캐싱 전략

```typescript
// 자주 사용되는 데이터 캐싱
const cache = new Map();

const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    const now = Date.now();

    // 5분 이내 데이터는 캐시 사용
    if (now - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

## 📚 추가 리소스

- [Swagger API 문서](http://localhost:3000/api)
- [Postman 컬렉션](./postman/)
- [에러 코드 목록](./ERROR_CODES.md)
- [데이터 모델](./DATA_MODELS.md)

---

**Team Elliot Backend Team** 🩰

> 더 나은 발레 교육을 위한 API를 제공합니다.
