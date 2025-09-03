# 🗄️ Team Elliot 데이터베이스 스키마 문서

Team Elliot 발레 학원 관리 시스템의 데이터베이스 구조와 관계를 설명하는 문서입니다.

## 📋 목차

1. [데이터베이스 개요](#데이터베이스-개요)
2. [주요 엔티티](#주요-엔티티)
3. [관계 모델](#관계-모델)
4. [데이터 타입 및 제약조건](#데이터-타입-및-제약조건)
5. [인덱스 및 성능](#인덱스-및-성능)
6. [마이그레이션 가이드](#마이그레이션-가이드)
7. [데이터 시드](#데이터-시드)

## 🏗️ 데이터베이스 개요

### 기술 스택

- **데이터베이스**: PostgreSQL 15+
- **ORM**: Prisma 6.x
- **마이그레이션**: Prisma Migrate
- **스키마 검증**: Prisma Client

### 주요 특징

- **정규화된 구조**: 데이터 중복 최소화
- **참조 무결성**: 외래 키 제약조건으로 데이터 일관성 보장
- **확장 가능한 설계**: 새로운 기능 추가 시 스키마 확장 용이
- **성능 최적화**: 적절한 인덱스와 관계 설계

## 🎯 주요 엔티티

### 1. 사용자 관리 (User Management)

#### User (사용자)

```sql
users (
  id: Int (PK, auto-increment)
  userId: String (unique) -- 로그인 ID
  password: String -- 암호화된 비밀번호
  name: String -- 사용자 이름
  role: Role -- 역할 (TEACHER, STUDENT, PRINCIPAL)
  createdAt: DateTime
  updatedAt: DateTime
)
```

#### Student (학생)

```sql
students (
  id: Int (PK, auto-increment)
  userId: String (unique)
  password: String
  name: String
  phoneNumber: String? -- 전화번호
  emergencyContact: String? -- 비상연락처
  birthDate: DateTime? -- 생년월일
  notes: String? -- 특이사항
  level: String? -- 발레 레벨
  userRefId: Int (FK -> users.id, unique)
  createdAt: DateTime
  updatedAt: DateTime
)
```

#### Teacher (강사)

```sql
teachers (
  id: Int (PK, auto-increment)
  userId: String (unique)
  password: String
  name: String
  phoneNumber: String?
  introduction: String? -- 자기소개
  photoUrl: String? -- 프로필 사진
  education: String[] -- 학력
  specialties: String[] -- 전공 분야
  certifications: String[] -- 자격증
  yearsOfExperience: Int? -- 경력 연차
  availableTimes: Json? -- 가능한 시간대
  userRefId: Int (FK -> users.id, unique)
  academyId: Int? (FK -> academies.id)
  createdAt: DateTime
  updatedAt: DateTime
)
```

#### Principal (원장)

```sql
principals (
  id: Int (PK, auto-increment)
  userId: String (unique)
  password: String
  name: String
  phoneNumber: String?
  email: String?
  introduction: String? -- 자기소개
  photoUrl: String? -- 프로필 사진
  education: String[] -- 학력
  certifications: String[] -- 자격증
  yearsOfExperience: Int? -- 경력 연차
  userRefId: Int (FK -> users.id, unique)
  academyId: Int (FK -> academies.id, unique)
  accountHolder: String? -- 예금주
  accountNumber: String? -- 계좌번호
  bankName: String? -- 은행명
  createdAt: DateTime
  updatedAt: DateTime
)
```

### 2. 학원 관리 (Academy Management)

#### Academy (학원)

```sql
academies (
  id: Int (PK, auto-increment)
  name: String -- 학원명
  phoneNumber: String -- 전화번호
  address: String -- 주소
  description: String -- 학원 설명
  code: String (unique) -- 학원 코드
  createdAt: DateTime
  updatedAt: DateTime
)
```

#### StudentAcademy (학생-학원 관계)

```sql
student_academies (
  id: Int (PK, auto-increment)
  studentId: Int (FK -> students.id)
  academyId: Int (FK -> academies.id)
  joinedAt: DateTime -- 가입일
  UNIQUE(studentId, academyId) -- 복합 유니크 제약
)
```

### 3. 수업 관리 (Class Management)

#### Class (수업)

```sql
classes (
  id: Int (PK, auto-increment)
  className: String -- 수업명
  classCode: String (unique) -- 수업 코드
  description: String? -- 수업 설명
  maxStudents: Int -- 최대 수강생 수
  tuitionFee: Decimal(10,2) -- 수업료
  teacherId: Int (FK -> teachers.id)
  dayOfWeek: String -- 요일
  level: String -- 수업 레벨
  status: String -- 상태 (DRAFT, ACTIVE, INACTIVE)
  startDate: DateTime -- 시작일
  endDate: DateTime -- 종료일
  classDetailId: Int? (FK -> class_details.id)
  backgroundColor: String? -- 배경색
  startTime: Time -- 시작 시간
  endTime: Time -- 종료 시간
  academyId: Int (FK -> academies.id)
)
```

#### ClassDetail (수업 상세 정보)

```sql
class_details (
  id: Int (PK, auto-increment)
  description: String -- 상세 설명
  teacherId: Int (FK -> teachers.id)
  locationName: String -- 장소명
  mapImageUrl: String -- 지도 이미지 URL
  requiredItems: String[] -- 준비물
  curriculum: String[] -- 커리큘럼
)
```

#### ClassSession (수업 세션)

```sql
class_sessions (
  id: Int (PK, auto-increment)
  classId: Int (FK -> classes.id)
  date: DateTime -- 세션 날짜
  startTime: DateTime -- 시작 시간
  endTime: DateTime -- 종료 시간
  currentStudents: Int -- 현재 수강생 수
  maxStudents: Int -- 최대 수강생 수
  UNIQUE(classId, date) -- 복합 유니크 제약
)
```

### 4. 수강 관리 (Enrollment Management)

#### Enrollment (수업 수강 신청)

```sql
enrollments (
  id: Int (PK, auto-increment)
  studentId: Int (FK -> students.id)
  classId: Int (FK -> classes.id)
  status: String -- 상태 (PENDING, CONFIRMED, CANCELLED)
  cancelledAt: DateTime? -- 취소일
  enrolledAt: DateTime -- 신청일
  UNIQUE(classId, studentId) -- 복합 유니크 제약
)
```

#### SessionEnrollment (세션별 수강 신청)

```sql
session_enrollments (
  id: Int (PK, auto-increment)
  studentId: Int (FK -> students.id)
  sessionId: Int (FK -> class_sessions.id)
  status: String -- 상태 (PENDING, CONFIRMED, REJECTED, CANCELLED, REFUND_REQUESTED, REFUND_CANCELLED, REFUND_REJECTED_CONFIRMED, TEACHER_CANCELLED, ABSENT, ATTENDED)
  enrolledAt: DateTime -- 신청일
  cancelledAt: DateTime? -- 취소일
  rejectedAt: DateTime? -- 거부일
  hasContributedToCurrentStudents: Boolean -- 현재 수강생 수에 반영 여부
  UNIQUE(studentId, sessionId) -- 복합 유니크 제약
)
```

### 5. 출석 관리 (Attendance Management)

#### Attendance (출석)

```sql
attendances (
  id: Int (PK, auto-increment)
  enrollmentId: Int (FK -> enrollments.id)
  classId: Int (FK -> classes.id)
  studentId: Int (FK -> students.id)
  date: DateTime -- 출석 날짜
  status: String -- 출석 상태
  note: String? -- 특이사항
)
```

### 6. 결제 및 환불 (Payment & Refund)

#### Payment (결제)

```sql
payments (
  id: Int (PK, auto-increment)
  studentId: Int (FK -> students.id)
  amount: Decimal(10,2) -- 결제 금액
  status: String -- 상태 (PENDING, COMPLETED, FAILED, REFUNDED)
  method: String -- 결제 방법
  paidAt: DateTime? -- 결제일
  enrollmentId: Int? (FK -> enrollments.id)
  sessionEnrollmentId: Int (FK -> session_enrollments.id, unique)
)
```

#### RefundRequest (환불 요청)

```sql
refund_requests (
  id: Int (PK, auto-increment)
  sessionEnrollmentId: Int (FK -> session_enrollments.id)
  studentId: Int (FK -> students.id)
  reason: String -- 환불 사유
  detailedReason: String? -- 상세 사유
  refundAmount: Decimal(10,2) -- 환불 요청 금액
  status: String -- 상태 (PENDING, APPROVED, REJECTED, CANCELLED)
  processReason: String? -- 처리 사유
  actualRefundAmount: Decimal(10,2)? -- 실제 환불 금액
  processedBy: Int? (FK -> users.id)
  processedAt: DateTime? -- 처리일
  requestedAt: DateTime -- 요청일
  cancelledAt: DateTime? -- 취소일
  accountHolder: String? -- 예금주
  accountNumber: String? -- 계좌번호
  bankName: String? -- 은행명
)
```

### 7. 발레 자세 관리 (Ballet Pose Management)

#### BalletPose (발레 자세)

```sql
ballet_poses (
  id: Int (PK, auto-increment)
  name: String (unique) -- 자세명
  imageUrl: String? -- 이미지 URL
  description: String -- 설명
  difficulty: PoseDifficulty -- 난이도 (BEGINNER, INTERMEDIATE, ADVANCED)
  createdAt: DateTime
  updatedAt: DateTime
)
```

#### SessionContent (세션 내용)

```sql
session_contents (
  id: Int (PK, auto-increment)
  sessionId: Int (FK -> class_sessions.id)
  poseId: Int (FK -> ballet_poses.id)
  order: Int -- 순서
  notes: String? -- 노트
  createdAt: DateTime
  UNIQUE(sessionId, poseId, order) -- 복합 유니크 제약
)
```

### 8. 기타 관리 (Other Management)

#### Notice (공지사항)

```sql
notices (
  id: Int (PK, auto-increment)
  title: String -- 제목
  content: String -- 내용
  authorId: Int (FK -> users.id)
  classId: Int? (FK -> classes.id)
  isImportant: Boolean -- 중요 공지 여부
  createdAt: DateTime
  updatedAt: DateTime
)
```

#### AcademyJoinRequest (학원 가입 요청)

```sql
academy_join_requests (
  id: Int (PK, auto-increment)
  teacherId: Int (FK -> teachers.id)
  academyId: Int (FK -> academies.id)
  status: AcademyRequestStatus -- 상태 (PENDING, APPROVED, REJECTED)
  message: String? -- 메시지
  createdAt: DateTime
  updatedAt: DateTime
  UNIQUE(teacherId, academyId) -- 복합 유니크 제약
)
```

#### AcademyCreationRequest (학원 생성 요청)

```sql
academy_creation_requests (
  id: Int (PK, auto-increment)
  teacherId: Int (FK -> teachers.id)
  name: String -- 학원명
  phoneNumber: String -- 전화번호
  address: String -- 주소
  description: String -- 설명
  status: AcademyRequestStatus -- 상태
  createdAt: DateTime
  updatedAt: DateTime
)
```

## 🔗 관계 모델

### 1. 사용자 계층 구조

```
User (1) ←→ (1) Student
User (1) ←→ (1) Teacher
User (1) ←→ (1) Principal
```

### 2. 학원 중심 관계

```
Academy (1) ←→ (1) Principal
Academy (1) ←→ (N) Teacher
Academy (1) ←→ (N) StudentAcademy ←→ (N) Student
Academy (1) ←→ (N) Class
```

### 3. 수업 관련 관계

```
Class (1) ←→ (1) Teacher
Class (1) ←→ (1) ClassDetail?
Class (1) ←→ (N) ClassSession
Class (1) ←→ (N) Enrollment
Class (1) ←→ (N) Notice
```

### 4. 세션 및 수강 관계

```
ClassSession (1) ←→ (N) SessionEnrollment
ClassSession (1) ←→ (N) SessionContent
SessionEnrollment (1) ←→ (1) Payment
SessionEnrollment (1) ←→ (N) RefundRequest
```

### 5. 출석 및 결제 관계

```
Enrollment (1) ←→ (N) Attendance
Enrollment (1) ←→ (N) Payment
Student (1) ←→ (N) Payment
Student (1) ←→ (N) RefundRequest
```

## 📊 데이터 타입 및 제약조건

### 기본 데이터 타입

- **Int**: 정수 (PK, FK, 일반 숫자)
- **String**: 문자열 (VARCHAR)
- **DateTime**: 날짜 및 시간
- **Decimal**: 소수점 숫자 (금액)
- **Boolean**: 불린 값
- **String[]**: 문자열 배열
- **Json**: JSON 데이터

### 제약조건

- **Primary Key (PK)**: 각 테이블의 고유 식별자
- **Foreign Key (FK)**: 다른 테이블과의 관계
- **Unique**: 중복 값 방지
- **Not Null**: NULL 값 방지
- **Default**: 기본값 설정
- **Check**: 데이터 유효성 검사

### 열거형 (Enum)

```typescript
enum Role {
  TEACHER
  STUDENT
  PRINCIPAL
}

enum AcademyRequestStatus {
  PENDING
  APPROVED
  REJECTED
}

enum PoseDifficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

## ⚡ 인덱스 및 성능

### 자동 생성 인덱스

- **Primary Key**: 자동으로 클러스터 인덱스 생성
- **Foreign Key**: 참조 성능 향상을 위한 인덱스
- **Unique**: 유니크 제약조건을 위한 인덱스

### 수동 생성 인덱스

```sql
-- 환불 요청 상태별 조회 성능 향상
CREATE INDEX idx_refund_requests_status ON refund_requests(status);

-- 수강 신청 상태별 조회 성능 향상
CREATE INDEX idx_session_enrollments_status ON session_enrollments(status);

-- 날짜별 조회 성능 향상
CREATE INDEX idx_class_sessions_date ON class_sessions(date);
```

### 성능 최적화 팁

1. **복합 인덱스**: 자주 함께 사용되는 컬럼들에 복합 인덱스 생성
2. **부분 인덱스**: 특정 조건을 만족하는 데이터만 인덱싱
3. **인덱스 유지보수**: 사용하지 않는 인덱스 제거
4. **쿼리 최적화**: EXPLAIN ANALYZE로 쿼리 성능 분석

## 🔄 마이그레이션 가이드

### 마이그레이션 생성

```bash
# 스키마 변경 후 마이그레이션 파일 생성
npx prisma migrate dev --name add_new_field

# 프로덕션 환경에서 마이그레이션 적용
npx prisma migrate deploy
```

### 마이그레이션 롤백

```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 특정 마이그레이션으로 롤백
npx prisma migrate reset
```

### 데이터베이스 리셋

```bash
# 개발 환경에서 데이터베이스 초기화
npm run db:reset

# 데이터베이스 초기화 후 시드 데이터 생성
npm run db:reset:seed
```

## 🌱 데이터 시드

### 시드 데이터 실행

```bash
# 기본 시드 데이터 생성
npm run seed

# 시드 파일 직접 실행
npx ts-node prisma/seed.ts
```

### 시드 데이터 구조

```typescript
// 기본 사용자 생성
const users = [
  {
    userId: 'admin',
    password: 'hashedPassword',
    name: '관리자',
    role: 'PRINCIPAL',
  },
  // ... 기타 사용자
];

// 기본 학원 생성
const academies = [
  {
    name: '발레 아카데미',
    phoneNumber: '02-1234-5678',
    address: '서울시 강남구',
    description: '전문적인 발레 교육',
    code: 'BALLET001',
  },
];

// 기본 발레 자세 생성
const balletPoses = [
  {
    name: '플리에',
    description: '발레의 기본 자세',
    difficulty: 'BEGINNER',
  },
];
```

## 🛠️ 개발 도구

### Prisma Studio

```bash
# 데이터베이스 GUI 도구 실행
npx prisma studio
```

### 스키마 검증

```bash
# 스키마 문법 검증
npx prisma validate

# Prisma 클라이언트 생성
npx prisma generate
```

### 데이터베이스 연결 테스트

```bash
# 연결 상태 확인
npx prisma db pull

# 스키마 동기화
npx prisma db push
```

## 📈 모니터링 및 유지보수

### 데이터베이스 상태 확인

```sql
-- 테이블 크기 확인
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public';

-- 인덱스 사용률 확인
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes;
```

### 성능 모니터링

```sql
-- 느린 쿼리 확인
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🔒 보안 고려사항

### 데이터 암호화

- **비밀번호**: bcrypt로 해시화
- **개인정보**: 민감한 데이터는 암호화 저장
- **연결**: SSL/TLS 사용 권장

### 접근 제어

- **역할 기반**: 사용자 역할에 따른 데이터 접근 제한
- **행 레벨 보안**: 사용자별 데이터 접근 제한
- **감사 로그**: 데이터 변경 이력 추적

## 📚 추가 리소스

- [Prisma 공식 문서](https://www.prisma.io/docs)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs)
- [데이터베이스 설계 가이드](./DATABASE_DESIGN_GUIDE.md)
- [성능 최적화 가이드](./PERFORMANCE_OPTIMIZATION.md)

---

**Team Elliot Backend Team** 🩰

> 안전하고 효율적인 데이터베이스 설계로 발레 교육을 지원합니다.
