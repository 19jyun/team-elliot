# 활동 로깅 시스템 가이드

## 개요

활동 로깅 시스템은 학원 관리 시스템의 모든 사용자 활동을 추적하고 기록하는 기능입니다. 신청/결제/환불/취소 내역 등을 체계적으로 조회할 수 있습니다.

## 주요 기능

### 1. 활동 타입 분류

- **수강 신청 관련**: 세션 신청, 배치 신청, 취소, 스케줄 변경 등
- **결제 관련**: 결제 시도, 완료, 실패, 취소, 환불 등
- **출석 관련**: 출석 체크, 수정, 지각, 결석 등
- **계정 관련**: 로그인, 로그아웃, 회원가입, 프로필 수정 등
- **클래스 관리**: 클래스 생성, 수정, 삭제, 상태 변경 등
- **학원 관련**: 학원 가입, 탈퇴, 정보 수정 등
- **관리자 활동**: 권한 변경, 시스템 설정, 공지사항 등

### 2. API 엔드포인트

#### 기본 조회

```
GET /activity-logs - 전체 활동 히스토리
GET /activity-logs/:id - 특정 활동 로그 조회
```

#### 카테고리별 조회

```
GET /activity-logs/enrollment-history - 수강 신청 내역
GET /activity-logs/payment-history - 결제 내역
GET /activity-logs/refund-cancellation-history - 환불/취소 내역
GET /activity-logs/attendance-history - 출석 내역
GET /activity-logs/category/:category - 카테고리별 활동 히스토리
```

#### 특정 엔티티 조회

```
GET /activity-logs/session/:sessionId - 특정 세션의 활동 히스토리
```

#### 통계 및 대시보드

```
GET /activity-logs/statistics - 개인 활동 통계
GET /activity-logs/admin/dashboard - 관리자 대시보드 데이터
```

### 3. 쿼리 파라미터

모든 조회 API는 다음 파라미터를 지원합니다:

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `startDate`: 시작 날짜 (YYYY-MM-DD)
- `endDate`: 종료 날짜 (YYYY-MM-DD)
- `action`: 특정 활동 타입 필터
- `level`: 로그 레벨 필터 (CRITICAL, IMPORTANT, NORMAL, DEBUG)
- `userRole`: 사용자 역할 필터 (관리자용)

### 4. 응답 형식

```json
{
  "logs": [
    {
      "id": 1,
      "userId": 123,
      "userRole": "STUDENT",
      "action": "ENROLL_SESSION",
      "entityType": "SESSION_ENROLLMENT",
      "entityId": 456,
      "description": "세션 456 수강 신청 완료",
      "level": "IMPORTANT",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": 123,
        "name": "김학생",
        "role": "STUDENT"
      },
      "oldValue": null,
      "newValue": {
        "sessionId": 456,
        "status": "CONFIRMED",
        "enrolledAt": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## 사용 예시

### 1. 수강 신청 내역 조회

```bash
# 학생의 수강 신청 내역 조회
GET /activity-logs/enrollment-history?page=1&limit=10

# 특정 기간의 수강 신청 내역
GET /activity-logs/enrollment-history?startDate=2024-01-01&endDate=2024-01-31
```

### 2. 결제 내역 조회

```bash
# 결제 완료된 내역만 조회
GET /activity-logs/payment-history?action=PAYMENT_COMPLETED

# 결제 실패 내역 조회
GET /activity-logs/payment-history?action=PAYMENT_FAILED&level=CRITICAL
```

### 3. 환불/취소 내역 조회

```bash
# 환불 요청 내역
GET /activity-logs/refund-cancellation-history?action=REFUND_REQUEST

# 취소된 수강 신청 내역
GET /activity-logs/refund-cancellation-history?action=CANCEL_ENROLLMENT
```

### 4. 출석 내역 조회

```bash
# 출석 체크 내역
GET /activity-logs/attendance-history?action=ATTENDANCE_CHECK

# 지각/결석 내역
GET /activity-logs/attendance-history?action=LATE_ATTENDANCE,ABSENT_ATTENDANCE
```

### 5. 관리자 대시보드

```bash
# 전체 활동 통계
GET /activity-logs/admin/dashboard

# 특정 역할 사용자의 활동
GET /activity-logs/admin/dashboard?userRole=STUDENT

# 특정 기간의 활동
GET /activity-logs/admin/dashboard?startDate=2024-01-01&endDate=2024-01-31
```

## 기존 서비스 통합 방법

### 1. ActivityLogService 주입

```typescript
import { ActivityLogService } from '../activity-log/activity-log.service';
import {
  ACTIVITY_TYPES,
  ENTITY_TYPES,
} from '../activity-log/constants/activity-types';

@Injectable()
export class YourService {
  constructor(private readonly activityLogService: ActivityLogService) {}
}
```

### 2. 활동 로그 기록

```typescript
// 성공 케이스
await this.activityLogService.create({
  userId: studentId,
  userRole: 'STUDENT',
  action: ACTIVITY_TYPES.ENROLLMENT.ENROLL_SESSION,
  entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
  entityId: enrollment.id,
  description: `세션 ${sessionId} 수강 신청 완료`,
  level: 'IMPORTANT',
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  newValue: {
    sessionId,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
  },
});

// 실패 케이스
await this.activityLogService.create({
  userId: studentId,
  userRole: 'STUDENT',
  action: ACTIVITY_TYPES.ENROLLMENT.ENROLL_SESSION,
  entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
  entityId: sessionId,
  description: `세션 ${sessionId} 수강 신청 실패: ${error.message}`,
  level: 'CRITICAL',
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  oldValue: { sessionId, error: error.message },
});
```

### 3. 배치 로깅

```typescript
// 여러 활동을 한 번에 기록
const activities = enrollments.map((enrollment) => ({
  userId: studentId,
  userRole: 'STUDENT',
  action: ACTIVITY_TYPES.ENROLLMENT.BATCH_ENROLL_SESSIONS,
  entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
  entityId: enrollment.id,
  description: `배치 수강 신청: 세션 ${enrollment.sessionId}`,
  level: 'IMPORTANT',
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  newValue: {
    sessionId: enrollment.sessionId,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
  },
}));

await this.activityLogService.logBatch(activities);
```

## 로그 레벨 설명

- **CRITICAL**: 시스템 오류, 보안 이슈, 중요한 실패
- **IMPORTANT**: 비즈니스 로직 관련 중요 활동 (결제, 신청, 환불 등)
- **NORMAL**: 일반적인 사용자 활동 (출석, 로그인 등)
- **DEBUG**: 개발/디버깅용 상세 정보

## 보안 고려사항

1. **IP 주소 및 User-Agent 기록**: 보안 감사 및 이상 활동 탐지
2. **변경 전후 값 기록**: 데이터 무결성 검증
3. **권한 기반 접근**: 사용자는 자신의 활동만 조회 가능
4. **관리자 권한**: 관리자는 전체 활동 조회 가능

## 성능 최적화

1. **인덱스 활용**: userId, createdAt, action, entityType 등에 인덱스 설정
2. **배치 로깅**: 여러 활동을 한 번에 기록하여 DB 부하 감소
3. **비동기 처리**: 중요하지 않은 로그는 비동기로 처리
4. **로그 보관 정책**: 오래된 로그는 아카이브 또는 삭제

## 모니터링 및 알림

1. **CRITICAL 레벨 로그**: 즉시 알림 발송
2. **IMPORTANT 레벨 로그**: 일일 리포트
3. **이상 패턴 탐지**: 비정상적인 활동 패턴 감지
4. **성능 모니터링**: 로그 기록 및 조회 성능 추적
