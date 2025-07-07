# ClassSession API 문서

## 개요

ClassSession API는 수업 세션 관리, 수강 신청, 출석 체크 등의 기능을 제공합니다. 모든 주요 활동은 자동으로 활동 로그에 기록됩니다.

## 주요 기능

### 1. 세션 관리 (선생님/관리자)

- **POST** `/class-sessions` - 세션 생성
- **PUT** `/class-sessions/:sessionId` - 세션 수정
- **DELETE** `/class-sessions/:sessionId` - 세션 삭제

### 2. 수강 신청 (학생)

- **POST** `/class-sessions/:sessionId/enroll` - 개별 세션 신청
- **POST** `/class-sessions/batch-enroll` - 배치 세션 신청
- **DELETE** `/class-sessions/enrollments/:enrollmentId` - 수강 취소
- **PUT** `/class-sessions/enrollments/:enrollmentId/change` - 수강 변경 (기존 취소 + 새로운 신청)
- **GET** `/class-sessions/student/enrollments` - 학생 수강 신청 목록

### 3. 수강 신청 관리 (선생님/관리자)

- **GET** `/class-sessions/teacher/enrollments` - 선생님 수강 신청 목록
- **PUT** `/class-sessions/enrollments/:enrollmentId/status` - 수강 신청 상태 변경
- **PUT** `/class-sessions/enrollments/batch-status` - 배치 상태 변경
- **PUT** `/class-sessions/enrollments/:enrollmentId/attendance` - 출석 체크

### 4. 조회

- **GET** `/class-sessions/class/:classId` - 클래스별 세션 목록

### 5. 시스템 관리

- **POST** `/class-sessions/complete-sessions` - 수업 완료 처리 (스케줄러용)

## 활동 로깅

### 기록되는 활동들

#### 세션 관리

- `CLASS_SESSION_CREATE` - 세션 생성
- `CLASS_SESSION_UPDATE` - 세션 수정
- `CLASS_SESSION_DELETE` - 세션 삭제

#### 수강 신청

- `ENROLL_SESSION` - 개별 세션 신청
- `BATCH_ENROLL_SESSIONS` - 배치 세션 신청
- `CANCEL_ENROLLMENT` - 수강 취소
- `CHANGE_ENROLLMENT` - 수강 변경 (기존 취소 + 새로운 신청)

#### 수강 신청 관리

- `APPROVE_ENROLLMENT` - 수강 승인
- `REJECT_ENROLLMENT` - 수강 거부
- `UPDATE_ENROLLMENT_STATUS` - 상태 변경
- `BATCH_APPROVE_ENROLLMENT` - 배치 승인
- `BATCH_REJECT_ENROLLMENT` - 배치 거부
- `BATCH_UPDATE_ENROLLMENT_STATUS` - 배치 상태 변경
- `COMPLETE_ENROLLMENT` - 수업 완료

#### 출석 관리

- `ATTENDANCE_CHECK` - 출석 체크
- `ABSENT_ATTENDANCE` - 결석 처리

#### 시스템

- `BATCH_SESSION_COMPLETE` - 배치 세션 완료 처리

## API 사용 예시

### 1. 세션 생성

```bash
POST /class-sessions
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "classId": 1,
  "date": "2024-01-15T00:00:00.000Z",
  "startTime": "2024-01-15T14:00:00.000Z",
  "endTime": "2024-01-15T16:00:00.000Z"
}
```

### 2. 수강 신청

```bash
POST /class-sessions/1/enroll
Authorization: Bearer <student_token>
```

### 3. 수강 승인

```bash
PUT /class-sessions/enrollments/1/status
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "reason": "정상 승인"
}
```

### 4. 출석 체크

```bash
PUT /class-sessions/enrollments/1/attendance
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "status": "ATTENDED"
}
```

### 5. 수강 취소 (학생)

```bash
DELETE /class-sessions/enrollments/1
Authorization: Bearer <student_token>
```

### 6. 수강 변경 (학생)

```bash
PUT /class-sessions/enrollments/1/change
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "newSessionId": 2,
  "reason": "스케줄 변경으로 인한 수강 변경"
}
```

## 상태 흐름

### 수강 신청 상태

1. `PENDING` - 대기 (기본값)
2. `CONFIRMED` - 승인 (선생님/관리자 승인)
3. `CANCELLED` - 거부/취소
4. `ATTENDED` - 출석 (수업 당일 출석 체크)
5. `ABSENT` - 결석 (수업 당일 결석 처리)
6. `COMPLETED` - 완료 (수업 종료 후 자동 변경)

### 권한별 기능

- **학생**: 수강 신청, 수강 취소, 자신의 수강 신청 조회
- **선생님**: 자신의 클래스 세션 관리, 수강 신청 승인/거부, 출석 체크
- **관리자**: 모든 기능 사용 가능

## 활동 로그 조회

활동 로그는 `/activity-logs` API를 통해 조회할 수 있습니다:

```bash
GET /activity-logs?entityType=SESSION_ENROLLMENT&action=ENROLL_SESSION
Authorization: Bearer <admin_token>
```

## 주의사항

1. **세션 삭제**: 수강 신청이 있는 세션은 삭제할 수 없습니다.
2. **수강 취소**: 수업이 시작된 후에는 취소할 수 없습니다.
3. **수강 변경**: 기존 수업과 변경할 수업 모두 시작 전에만 가능합니다.
4. **출석 체크**: 수업 당일에만 가능합니다.
5. **자동 완료**: 수업 종료 후 자동으로 COMPLETED 상태로 변경됩니다.
6. **권한 검증**: 모든 API는 적절한 권한 검증을 수행합니다.
