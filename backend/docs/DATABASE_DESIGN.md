# 🗄️ 데이터베이스 설계 문서

Team Elliot 백엔드 프로젝트의 데이터베이스 설계 및 구조를 설명합니다.

## 📋 목차

- [데이터베이스 개요](#-데이터베이스-개요)
- [ERD (Entity Relationship Diagram)](#-erd-entity-relationship-diagram)
- [테이블 구조](#-테이블-구조)
- [인덱스 설계](#-인덱스-설계)
- [제약조건](#-제약조건)
- [데이터 타입 매핑](#-데이터-타입-매핑)

## 🎯 데이터베이스 개요

### 기술 스택

- **데이터베이스**: PostgreSQL 15+
- **ORM**: Prisma
- **마이그레이션**: Prisma Migrate
- **시드 데이터**: Prisma Seed

### 주요 특징

- **정규화된 구조**: 3NF 이상의 정규화 적용
- **참조 무결성**: 외래키 제약조건으로 데이터 일관성 보장
- **인덱스 최적화**: 자주 조회되는 컬럼에 인덱스 적용
- **소프트 삭제**: 중요한 데이터는 논리적 삭제 방식 사용

## 🎨 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    User ||--o| Student : "1:1"
    User ||--o| Teacher : "1:1"
    User ||--o| Principal : "1:1"

    Academy ||--o{ Class : "1:N"
    Academy ||--o{ StudentAcademy : "1:N"
    Academy ||--o{ Teacher : "1:N"
    Academy ||--|| Principal : "1:1"

    Teacher ||--o{ Class : "1:N"
    Teacher ||--o{ AcademyJoinRequest : "1:N"
    Teacher ||--o{ AcademyCreationRequest : "1:N"

    Student ||--o{ StudentAcademy : "1:N"
    Student ||--o{ Enrollment : "1:N"
    Student ||--o{ SessionEnrollment : "1:N"
    Student ||--o{ Payment : "1:N"
    Student ||--o{ RefundRequest : "1:N"

    Class ||--o{ ClassSession : "1:N"
    Class ||--o{ Enrollment : "1:N"
    Class ||--o{ Attendance : "1:N"
    Class ||--o{ Notice : "1:N"
    Class ||--o| ClassDetail : "1:1"

    ClassSession ||--o{ SessionEnrollment : "1:N"
    ClassSession ||--o{ SessionContent : "1:N"
    ClassSession ||--o{ Attendance : "1:N"

    SessionEnrollment ||--o| Payment : "1:1"
    SessionEnrollment ||--o{ RefundRequest : "1:N"

    BalletPose ||--o{ SessionContent : "1:N"

    User ||--o{ Notice : "1:N"
    User ||--o{ RefundRequest : "1:N"
    User ||--o{ RejectionDetail : "1:N"
```

## 📊 테이블 구조

### 1. 사용자 관련 테이블

#### `users` - 기본 사용자 정보

| 컬럼명    | 타입         | 제약조건           | 설명                                      |
| --------- | ------------ | ------------------ | ----------------------------------------- |
| id        | INT          | PK, AUTO_INCREMENT | 사용자 고유 ID                            |
| userId    | VARCHAR(255) | UNIQUE, NOT NULL   | 로그인용 사용자 ID                        |
| password  | VARCHAR(255) | NOT NULL           | 암호화된 비밀번호                         |
| name      | VARCHAR(100) | NOT NULL           | 사용자 이름                               |
| role      | ENUM         | NOT NULL           | 사용자 역할 (STUDENT, TEACHER, PRINCIPAL) |
| createdAt | DATETIME     | DEFAULT NOW()      | 생성일시                                  |
| updatedAt | DATETIME     | ON UPDATE NOW()    | 수정일시                                  |

#### `students` - 학생 정보

| 컬럼명           | 타입         | 제약조건           | 설명               |
| ---------------- | ------------ | ------------------ | ------------------ |
| id               | INT          | PK, AUTO_INCREMENT | 학생 고유 ID       |
| userId           | VARCHAR(255) | UNIQUE, NOT NULL   | 로그인용 사용자 ID |
| password         | VARCHAR(255) | NOT NULL           | 암호화된 비밀번호  |
| name             | VARCHAR(100) | NOT NULL           | 학생 이름          |
| phoneNumber      | VARCHAR(20)  | NULL               | 전화번호           |
| emergencyContact | VARCHAR(20)  | NULL               | 비상연락처         |
| birthDate        | DATETIME     | NULL               | 생년월일           |
| notes            | TEXT         | NULL               | 특이사항           |
| level            | VARCHAR(50)  | NULL               | 수강 레벨          |
| userRefId        | INT          | UNIQUE, FK         | users.id 참조      |
| createdAt        | DATETIME     | DEFAULT NOW()      | 생성일시           |
| updatedAt        | DATETIME     | ON UPDATE NOW()    | 수정일시           |

#### `teachers` - 선생님 정보

| 컬럼명            | 타입         | 제약조건           | 설명               |
| ----------------- | ------------ | ------------------ | ------------------ |
| id                | INT          | PK, AUTO_INCREMENT | 선생님 고유 ID     |
| userId            | VARCHAR(255) | UNIQUE, NOT NULL   | 로그인용 사용자 ID |
| password          | VARCHAR(255) | NOT NULL           | 암호화된 비밀번호  |
| name              | VARCHAR(100) | NOT NULL           | 선생님 이름        |
| phoneNumber       | VARCHAR(20)  | NULL               | 전화번호           |
| introduction      | TEXT         | NULL               | 자기소개           |
| photoUrl          | VARCHAR(255) | NULL               | 프로필 사진 URL    |
| education         | JSON         | NULL               | 학력 정보          |
| specialties       | JSON         | NULL               | 전문 분야          |
| certifications    | JSON         | NULL               | 자격증 정보        |
| yearsOfExperience | INT          | NULL               | 경력 년수          |
| availableTimes    | JSON         | NULL               | 가능한 시간대      |
| userRefId         | INT          | UNIQUE, FK         | users.id 참조      |
| academyId         | INT          | FK                 | academies.id 참조  |
| createdAt         | DATETIME     | DEFAULT NOW()      | 생성일시           |
| updatedAt         | DATETIME     | ON UPDATE NOW()    | 수정일시           |

#### `principals` - 원장 정보

| 컬럼명            | 타입         | 제약조건           | 설명               |
| ----------------- | ------------ | ------------------ | ------------------ |
| id                | INT          | PK, AUTO_INCREMENT | 원장 고유 ID       |
| userId            | VARCHAR(255) | UNIQUE, NOT NULL   | 로그인용 사용자 ID |
| password          | VARCHAR(255) | NOT NULL           | 암호화된 비밀번호  |
| name              | VARCHAR(100) | NOT NULL           | 원장 이름          |
| phoneNumber       | VARCHAR(20)  | NULL               | 전화번호           |
| email             | VARCHAR(255) | NULL               | 이메일             |
| introduction      | TEXT         | NULL               | 자기소개           |
| photoUrl          | VARCHAR(255) | NULL               | 프로필 사진 URL    |
| education         | JSON         | NULL               | 학력 정보          |
| certifications    | JSON         | NULL               | 자격증 정보        |
| yearsOfExperience | INT          | NULL               | 경력 년수          |
| userRefId         | INT          | UNIQUE, FK         | users.id 참조      |
| academyId         | INT          | UNIQUE, FK         | academies.id 참조  |
| accountHolder     | VARCHAR(50)  | NULL               | 계좌 예금주        |
| accountNumber     | VARCHAR(20)  | NULL               | 계좌번호           |
| bankName          | VARCHAR(50)  | NULL               | 은행명             |
| createdAt         | DATETIME     | DEFAULT NOW()      | 생성일시           |
| updatedAt         | DATETIME     | ON UPDATE NOW()    | 수정일시           |

### 2. 학원 관련 테이블

#### `academies` - 학원 정보

| 컬럼명      | 타입         | 제약조건           | 설명          |
| ----------- | ------------ | ------------------ | ------------- |
| id          | INT          | PK, AUTO_INCREMENT | 학원 고유 ID  |
| name        | VARCHAR(100) | NOT NULL           | 학원명        |
| phoneNumber | VARCHAR(20)  | NOT NULL           | 학원 전화번호 |
| address     | TEXT         | NOT NULL           | 학원 주소     |
| description | TEXT         | NOT NULL           | 학원 설명     |
| code        | VARCHAR(50)  | UNIQUE, NOT NULL   | 학원 코드     |
| createdAt   | DATETIME     | DEFAULT NOW()      | 생성일시      |
| updatedAt   | DATETIME     | ON UPDATE NOW()    | 수정일시      |

#### `student_academies` - 학생-학원 관계

| 컬럼명    | 타입     | 제약조건           | 설명              |
| --------- | -------- | ------------------ | ----------------- |
| id        | INT      | PK, AUTO_INCREMENT | 관계 고유 ID      |
| studentId | INT      | FK, NOT NULL       | students.id 참조  |
| academyId | INT      | FK, NOT NULL       | academies.id 참조 |
| joinedAt  | DATETIME | DEFAULT NOW()      | 가입일시          |

### 3. 클래스 관련 테이블

#### `classes` - 클래스 정보

| 컬럼명          | 타입          | 제약조건           | 설명                  |
| --------------- | ------------- | ------------------ | --------------------- |
| id              | INT           | PK, AUTO_INCREMENT | 클래스 고유 ID        |
| className       | VARCHAR(100)  | NOT NULL           | 클래스명              |
| classCode       | VARCHAR(50)   | UNIQUE, NOT NULL   | 클래스 코드           |
| description     | TEXT          | NULL               | 클래스 설명           |
| maxStudents     | INT           | NOT NULL           | 최대 수강생 수        |
| tuitionFee      | DECIMAL(10,2) | NOT NULL           | 수강료                |
| teacherId       | INT           | FK, NOT NULL       | teachers.id 참조      |
| dayOfWeek       | VARCHAR(10)   | NOT NULL           | 요일                  |
| level           | VARCHAR(50)   | NOT NULL           | 난이도                |
| status          | VARCHAR(20)   | DEFAULT 'DRAFT'    | 상태                  |
| startDate       | DATETIME      | NOT NULL           | 시작일                |
| endDate         | DATETIME      | NOT NULL           | 종료일                |
| classDetailId   | INT           | FK                 | class_details.id 참조 |
| backgroundColor | VARCHAR(50)   | NULL               | 배경색                |
| startTime       | TIME          | NOT NULL           | 시작 시간             |
| endTime         | TIME          | NOT NULL           | 종료 시간             |
| academyId       | INT           | FK, NOT NULL       | academies.id 참조     |

#### `class_details` - 클래스 상세 정보

| 컬럼명        | 타입         | 제약조건           | 설명              |
| ------------- | ------------ | ------------------ | ----------------- |
| id            | INT          | PK, AUTO_INCREMENT | 상세 정보 고유 ID |
| description   | TEXT         | NOT NULL           | 상세 설명         |
| teacherId     | INT          | FK, NOT NULL       | teachers.id 참조  |
| locationName  | VARCHAR(100) | NOT NULL           | 장소명            |
| mapImageUrl   | VARCHAR(255) | NOT NULL           | 지도 이미지 URL   |
| requiredItems | JSON         | NULL               | 준비물 목록       |
| curriculum    | JSON         | NULL               | 커리큘럼          |

#### `class_sessions` - 클래스 세션

| 컬럼명          | 타입     | 제약조건           | 설명            |
| --------------- | -------- | ------------------ | --------------- |
| id              | INT      | PK, AUTO_INCREMENT | 세션 고유 ID    |
| classId         | INT      | FK, NOT NULL       | classes.id 참조 |
| date            | DATETIME | NOT NULL           | 세션 날짜       |
| startTime       | DATETIME | NOT NULL           | 시작 시간       |
| endTime         | DATETIME | NOT NULL           | 종료 시간       |
| currentStudents | INT      | DEFAULT 0          | 현재 수강생 수  |
| maxStudents     | INT      | NOT NULL           | 최대 수강생 수  |

### 4. 수강 관련 테이블

#### `enrollments` - 클래스 수강 신청

| 컬럼명      | 타입        | 제약조건           | 설명              |
| ----------- | ----------- | ------------------ | ----------------- |
| id          | INT         | PK, AUTO_INCREMENT | 수강 신청 고유 ID |
| studentId   | INT         | FK, NOT NULL       | students.id 참조  |
| classId     | INT         | FK, NOT NULL       | classes.id 참조   |
| status      | VARCHAR(20) | DEFAULT 'PENDING'  | 상태              |
| cancelledAt | DATETIME    | NULL               | 취소일시          |
| enrolledAt  | DATETIME    | DEFAULT NOW()      | 신청일시          |

#### `session_enrollments` - 세션 수강 신청

| 컬럼명                          | 타입        | 제약조건           | 설명                       |
| ------------------------------- | ----------- | ------------------ | -------------------------- |
| id                              | INT         | PK, AUTO_INCREMENT | 세션 수강 신청 고유 ID     |
| studentId                       | INT         | FK, NOT NULL       | students.id 참조           |
| sessionId                       | INT         | FK, NOT NULL       | class_sessions.id 참조     |
| status                          | VARCHAR(20) | DEFAULT 'PENDING'  | 상태                       |
| enrolledAt                      | DATETIME    | DEFAULT NOW()      | 신청일시                   |
| cancelledAt                     | DATETIME    | NULL               | 취소일시                   |
| rejectedAt                      | DATETIME    | NULL               | 거부일시                   |
| hasContributedToCurrentStudents | BOOLEAN     | DEFAULT FALSE      | 현재 수강생 수에 반영 여부 |

#### `attendances` - 출석 관리

| 컬럼명       | 타입        | 제약조건           | 설명                |
| ------------ | ----------- | ------------------ | ------------------- |
| id           | INT         | PK, AUTO_INCREMENT | 출석 고유 ID        |
| enrollmentId | INT         | FK, NOT NULL       | enrollments.id 참조 |
| classId      | INT         | FK, NOT NULL       | classes.id 참조     |
| studentId    | INT         | FK, NOT NULL       | students.id 참조    |
| date         | DATETIME    | NOT NULL           | 출석 날짜           |
| status       | VARCHAR(20) | NOT NULL           | 출석 상태           |
| note         | TEXT        | NULL               | 비고                |

### 5. 결제 관련 테이블

#### `payments` - 결제 정보

| 컬럼명              | 타입          | 제약조건           | 설명                        |
| ------------------- | ------------- | ------------------ | --------------------------- |
| id                  | INT           | PK, AUTO_INCREMENT | 결제 고유 ID                |
| studentId           | INT           | FK, NOT NULL       | students.id 참조            |
| amount              | DECIMAL(10,2) | NOT NULL           | 결제 금액                   |
| status              | VARCHAR(20)   | NOT NULL           | 결제 상태                   |
| method              | VARCHAR(20)   | NOT NULL           | 결제 방법                   |
| paidAt              | DATETIME      | NULL               | 결제일시                    |
| enrollmentId        | INT           | FK                 | enrollments.id 참조         |
| sessionEnrollmentId | INT           | UNIQUE, FK         | session_enrollments.id 참조 |

#### `refund_requests` - 환불 신청

| 컬럼명              | 타입          | 제약조건           | 설명                        |
| ------------------- | ------------- | ------------------ | --------------------------- |
| id                  | INT           | PK, AUTO_INCREMENT | 환불 신청 고유 ID           |
| sessionEnrollmentId | INT           | FK, NOT NULL       | session_enrollments.id 참조 |
| studentId           | INT           | FK, NOT NULL       | students.id 참조            |
| reason              | TEXT          | NOT NULL           | 환불 사유                   |
| detailedReason      | TEXT          | NULL               | 상세 사유                   |
| refundAmount        | DECIMAL(10,2) | NOT NULL           | 환불 요청 금액              |
| status              | VARCHAR(20)   | DEFAULT 'PENDING'  | 처리 상태                   |
| processReason       | TEXT          | NULL               | 처리 사유                   |
| actualRefundAmount  | DECIMAL(10,2) | NULL               | 실제 환불 금액              |
| processedBy         | INT           | FK                 | users.id 참조 (처리자)      |
| processedAt         | DATETIME      | NULL               | 처리일시                    |
| requestedAt         | DATETIME      | DEFAULT NOW()      | 신청일시                    |
| cancelledAt         | DATETIME      | NULL               | 취소일시                    |
| accountHolder       | VARCHAR(50)   | NULL               | 환불 계좌 예금주            |
| accountNumber       | VARCHAR(20)   | NULL               | 환불 계좌번호               |
| bankName            | VARCHAR(50)   | NULL               | 환불 계좌 은행명            |

### 6. 기타 테이블

#### `notices` - 공지사항

| 컬럼명      | 타입         | 제약조건           | 설명             |
| ----------- | ------------ | ------------------ | ---------------- |
| id          | INT          | PK, AUTO_INCREMENT | 공지사항 고유 ID |
| title       | VARCHAR(255) | NOT NULL           | 제목             |
| content     | TEXT         | NOT NULL           | 내용             |
| authorId    | INT          | FK, NOT NULL       | users.id 참조    |
| classId     | INT          | FK                 | classes.id 참조  |
| isImportant | BOOLEAN      | DEFAULT FALSE      | 중요 공지 여부   |
| createdAt   | DATETIME     | DEFAULT NOW()      | 생성일시         |
| updatedAt   | DATETIME     | ON UPDATE NOW()    | 수정일시         |

#### `ballet_poses` - 발레 포즈

| 컬럼명      | 타입         | 제약조건           | 설명         |
| ----------- | ------------ | ------------------ | ------------ |
| id          | INT          | PK, AUTO_INCREMENT | 포즈 고유 ID |
| name        | VARCHAR(100) | UNIQUE, NOT NULL   | 포즈명       |
| imageUrl    | VARCHAR(255) | NULL               | 이미지 URL   |
| description | TEXT         | NOT NULL           | 설명         |
| difficulty  | ENUM         | DEFAULT 'BEGINNER' | 난이도       |
| createdAt   | DATETIME     | DEFAULT NOW()      | 생성일시     |
| updatedAt   | DATETIME     | ON UPDATE NOW()    | 수정일시     |

#### `session_contents` - 세션 콘텐츠

| 컬럼명    | 타입     | 제약조건           | 설명                   |
| --------- | -------- | ------------------ | ---------------------- |
| id        | INT      | PK, AUTO_INCREMENT | 콘텐츠 고유 ID         |
| sessionId | INT      | FK, NOT NULL       | class_sessions.id 참조 |
| poseId    | INT      | FK, NOT NULL       | ballet_poses.id 참조   |
| order     | INT      | DEFAULT 0          | 순서                   |
| notes     | TEXT     | NULL               | 비고                   |
| createdAt | DATETIME | DEFAULT NOW()      | 생성일시               |

## 🔍 인덱스 설계

### 주요 인덱스

#### 복합 인덱스

```sql
-- 학생-학원 관계 조회 최적화
CREATE INDEX idx_student_academies_student_academy
ON student_academies(student_id, academy_id);

-- 세션 수강 신청 조회 최적화
CREATE INDEX idx_session_enrollments_student_session
ON session_enrollments(student_id, session_id);

-- 클래스 수강 신청 조회 최적화
CREATE INDEX idx_enrollments_class_student
ON enrollments(class_id, student_id);

-- 환불 신청 조회 최적화
CREATE INDEX idx_refund_requests_student_status
ON refund_requests(student_id, status);
```

#### 단일 컬럼 인덱스

```sql
-- 자주 조회되는 컬럼들
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_students_user_ref_id ON students(user_ref_id);
CREATE INDEX idx_teachers_user_ref_id ON teachers(user_ref_id);
CREATE INDEX idx_principals_user_ref_id ON principals(user_ref_id);
CREATE INDEX idx_classes_academy_id ON classes(academy_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_class_sessions_class_id ON class_sessions(class_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
```

## 🔒 제약조건

### 외래키 제약조건

- **CASCADE 삭제**: 학원 삭제 시 관련 데이터 자동 삭제
- **RESTRICT 삭제**: 사용자 삭제 시 관련 데이터 보호
- **SET NULL**: 선택적 관계에서 NULL 허용

### 유니크 제약조건

- `users.user_id`: 로그인 ID 중복 방지
- `academies.code`: 학원 코드 중복 방지
- `classes.class_code`: 클래스 코드 중복 방지
- `enrollments(class_id, student_id)`: 중복 수강 신청 방지
- `session_enrollments(student_id, session_id)`: 중복 세션 신청 방지

### 체크 제약조건

- `tuition_fee >= 0`: 수강료는 0 이상
- `max_students > 0`: 최대 수강생 수는 1 이상
- `refund_amount >= 0`: 환불 금액은 0 이상

## 📝 데이터 타입 매핑

### Prisma → PostgreSQL 타입 매핑

| Prisma 타입 | PostgreSQL 타입 | 설명                |
| ----------- | --------------- | ------------------- |
| `String`    | `VARCHAR(n)`    | 가변 길이 문자열    |
| `Int`       | `INTEGER`       | 32비트 정수         |
| `BigInt`    | `BIGINT`        | 64비트 정수         |
| `Float`     | `REAL`          | 단정밀도 부동소수점 |
| `Decimal`   | `DECIMAL(p,s)`  | 고정소수점          |
| `Boolean`   | `BOOLEAN`       | 논리값              |
| `DateTime`  | `TIMESTAMP`     | 날짜와 시간         |
| `Json`      | `JSONB`         | JSON 데이터         |
| `Enum`      | `ENUM`          | 열거형              |

### ENUM 타입 정의

```sql
-- 사용자 역할
CREATE TYPE role AS ENUM ('STUDENT', 'TEACHER', 'PRINCIPAL');

-- 거부 유형
CREATE TYPE rejection_type AS ENUM (
    'ENROLLMENT_REJECTION',
    'REFUND_REJECTION',
    'SESSION_ENROLLMENT_REJECTION'
);

-- 학원 요청 상태
CREATE TYPE academy_request_status AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED'
);

-- 포즈 난이도
CREATE TYPE pose_difficulty AS ENUM (
    'BEGINNER', 'INTERMEDIATE', 'ADVANCED'
);
```

---

이 문서는 Team Elliot 백엔드 프로젝트의 데이터베이스 설계를 상세히 설명합니다. 데이터베이스 구조 변경 시 이 문서도 함께 업데이트해야 합니다.
