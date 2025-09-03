# 🗂️ Team Elliot 데이터베이스 ERD

Team Elliot 발레 학원 관리 시스템의 데이터베이스 관계도를 설명하는 문서입니다.

## 📊 ERD 개요

### 주요 엔티티 그룹

1. **사용자 관리**: User, Student, Teacher, Principal
2. **학원 관리**: Academy, StudentAcademy
3. **수업 관리**: Class, ClassDetail, ClassSession
4. **수강 관리**: Enrollment, SessionEnrollment
5. **결제 관리**: Payment, RefundRequest
6. **콘텐츠 관리**: BalletPose, SessionContent

## 🔗 핵심 관계

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
```

### 4. 세션 및 수강 관계

```
ClassSession (1) ←→ (N) SessionEnrollment
ClassSession (1) ←→ (N) SessionContent
SessionEnrollment (1) ←→ (1) Payment
SessionEnrollment (1) ←→ (N) RefundRequest
```

## 📋 테이블 목록

### 사용자 관련

- `users` - 기본 사용자 정보
- `students` - 학생 상세 정보
- `teachers` - 강사 상세 정보
- `principals` - 원장 상세 정보

### 학원 관련

- `academies` - 학원 정보
- `student_academies` - 학생-학원 관계
- `academy_join_requests` - 학원 가입 요청
- `academy_creation_requests` - 학원 생성 요청

### 수업 관련

- `classes` - 수업 정보
- `class_details` - 수업 상세 정보
- `class_sessions` - 수업 세션
- `enrollments` - 수업 수강 신청
- `session_enrollments` - 세션별 수강 신청

### 결제 관련

- `payments` - 결제 정보
- `refund_requests` - 환불 요청

### 콘텐츠 관련

- `ballet_poses` - 발레 자세
- `session_contents` - 세션 내용

### 기타

- `attendances` - 출석 정보
- `notices` - 공지사항
- `withdrawal_histories` - 탈퇴 이력
- `rejection_details` - 거부 상세 정보

## 🔐 제약조건

### 유니크 제약

- `users.userId` - 로그인 ID 중복 방지
- `academies.code` - 학원 코드 중복 방지
- `classes.classCode` - 수업 코드 중복 방지
- `ballet_poses.name` - 발레 자세명 중복 방지

### 복합 유니크 제약

- `student_academies(studentId, academyId)` - 학생-학원 중복 가입 방지
- `enrollments(classId, studentId)` - 동일 수업 중복 신청 방지
- `session_enrollments(studentId, sessionId)` - 동일 세션 중복 신청 방지
- `class_sessions(classId, date)` - 동일 수업 동일 날짜 중복 방지

## 📈 성능 최적화

### 주요 인덱스

- **Primary Key**: 모든 테이블의 `id` 컬럼
- **Foreign Key**: 관계 테이블 연결 성능 향상
- **Unique**: 중복 데이터 방지 및 검색 성능 향상
- **복합 인덱스**: 자주 함께 사용되는 컬럼들

### 쿼리 최적화 팁

1. **JOIN 최적화**: 적절한 인덱스 사용
2. **WHERE 절**: 인덱스가 있는 컬럼 우선 사용
3. **ORDER BY**: 인덱스가 있는 컬럼 사용
4. **LIMIT**: 페이지네이션으로 대용량 데이터 처리

## 🛠️ 개발 시 주의사항

### 데이터 무결성

- **CASCADE 삭제**: 학원 삭제 시 관련 데이터 자동 삭제
- **참조 무결성**: 외래 키 제약조건으로 데이터 일관성 보장
- **트랜잭션**: 복잡한 데이터 변경 시 트랜잭션 사용

### 확장성 고려

- **정규화**: 데이터 중복 최소화
- **유연한 설계**: 새로운 기능 추가 시 스키마 확장 용이
- **성능 모니터링**: 정기적인 쿼리 성능 분석

---

**Team Elliot Backend Team** 🩰

> 체계적인 데이터베이스 설계로 안정적인 서비스를 제공합니다.
