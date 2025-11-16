# 레거시 코드 정리 가이드

## 📋 개요

React Query 아키텍처로 마이그레이션 완료 후, 사용되지 않는 레거시 코드들을 정리하는 가이드입니다.

---

## 🗑️ 제거 가능한 레거시 Hooks

### 1. 레거시 API Hooks (서버 상태 관리)

**위치**: `frontend/src/hooks/`

#### ❌ 제거 가능한 파일들:

- `frontend/src/hooks/teacher/useTeacherApi.ts`
- `frontend/src/hooks/student/useStudentApi.ts`
- `frontend/src/hooks/principal/usePrincipalApi.ts`

**상태**:

- ✅ 컴포넌트에서 사용되지 않음
- ⚠️ 테스트 파일(`__tests__/integration/flows/student-enrollment.test.tsx`)에서만 사용 중
- **조치**: 테스트 파일을 React Query hooks로 업데이트한 후 제거 가능

**대체**: React Query hooks로 완전히 대체됨

- `useTeacherProfile`, `useTeacherClasses` 등
- `useStudentProfile`, `useStudentEnrollmentHistory` 등
- `usePrincipalProfile`, `usePrincipalEnrollments` 등

---

### 2. 레거시 캘린더 API Hooks

**위치**: `frontend/src/hooks/calendar/`

#### ❌ 제거 가능한 파일들:

- `frontend/src/hooks/calendar/useTeacherCalendarApi.ts`
- `frontend/src/hooks/calendar/useRoleCalendarApi.ts`
- `frontend/src/hooks/calendar/usePrincipalCalendarApi.ts`
- `frontend/src/hooks/calendar/useStudentCalendarApi.ts`

**상태**:

- ✅ 컴포넌트에서 사용되지 않음
- **조치**: 즉시 제거 가능

**대체**: React Query hooks로 완전히 대체됨

- `useTeacherCalendarSessions`
- `usePrincipalCalendarSessions`
- `useStudentCalendarSessions`

---

## 🔴 Redux Slice 정리 (서버 상태 부분)

### 현재 상태

Redux store에는 여전히 서버 상태를 관리하는 슬라이스들이 남아있습니다:

```typescript
// frontend/src/store/index.ts
reducer: {
  // 기존 서버 상태 슬라이스 (점진적 제거 예정)
  common: commonReducer,
  principal: principalReducer,  // ⚠️ 서버 상태 포함
  student: studentReducer,      // ⚠️ 서버 상태 포함
  teacher: teacherReducer,     // ⚠️ 서버 상태 포함
  ui: uiReducer,

  // 새로운 글로벌 비즈니스 상태 슬라이스
  auth: authReducer,
  permission: permissionReducer,
  calendarSync: calendarSyncReducer,
}
```

### 제거 가능한 Redux 액션들

#### `principalSlice.ts`

다음 액션들은 React Query로 대체되었으므로 제거 가능:

- `setPrincipalData` - 서버 데이터 설정
- `setPrincipalEnrollments` - 수강신청 목록 (React Query: `usePrincipalEnrollments`)
- `setPrincipalRefundRequests` - 환불 요청 목록 (React Query: `usePrincipalRefundRequests`)
- `setPrincipalCalendarSessions` - 캘린더 세션 (React Query: `usePrincipalCalendarSessions`)
- `updatePrincipalEnrollment` - 수강신청 업데이트 (Socket + React Query 무효화로 대체)
- `updatePrincipalRefundRequest` - 환불 요청 업데이트 (Socket + React Query 무효화로 대체)

**유지해야 할 액션들**:

- Socket 이벤트 기반 실시간 업데이트 액션들 (아직 사용 중일 수 있음)

#### `studentSlice.ts`

다음 액션들은 React Query로 대체되었으므로 제거 가능:

- `setStudentData` - 서버 데이터 설정
- `setStudentEnrollmentHistory` - 수강 내역 (React Query: `useStudentEnrollmentHistory`)
- `setStudentCancellationHistory` - 환불 내역 (React Query: `useStudentCancellationHistory`)
- `setStudentCalendarSessions` - 캘린더 세션 (React Query: `useStudentCalendarSessions`)
- `updateStudentEnrollmentHistory` - 수강 내역 업데이트 (Socket + React Query 무효화로 대체)
- `updateStudentCancellationFromSocket` - 환불 상태 업데이트 (Socket + React Query 무효화로 대체)

**유지해야 할 액션들**:

- 낙관적 업데이트 관련 액션들 (아직 사용 중일 수 있음)
- Socket 이벤트 기반 실시간 업데이트 액션들

#### `teacherSlice.ts`

다음 액션들은 React Query로 대체되었으므로 제거 가능:

- `setTeacherData` - 서버 데이터 설정
- `setTeacherCalendarSessions` - 캘린더 세션 (React Query: `useTeacherCalendarSessions`)

---

## ⚠️ 주의사항

### 1. 테스트 파일

테스트 파일에서 레거시 hooks를 사용 중이므로, 테스트를 먼저 업데이트해야 합니다:

- `frontend/src/__tests__/integration/flows/student-enrollment.test.tsx`

### 2. Redux Middleware

`calendarSyncMiddleware`는 여전히 Redux 액션에 의존하고 있습니다.
이 부분도 React Query Mutation의 `onSuccess`로 마이그레이션해야 합니다.

### 3. 점진적 제거

Redux slice의 서버 상태 부분을 한 번에 제거하지 말고,
각 기능별로 React Query로 완전히 마이그레이션된 후 제거하는 것이 안전합니다.

---

## 📝 제거 체크리스트

### Phase 1: Hooks 제거

- [ ] 테스트 파일 업데이트 (React Query hooks 사용)
- [ ] `useTeacherApi.ts` 제거
- [ ] `useStudentApi.ts` 제거
- [ ] `usePrincipalApi.ts` 제거
- [ ] `useTeacherCalendarApi.ts` 제거
- [ ] `useRoleCalendarApi.ts` 제거
- [ ] `usePrincipalCalendarApi.ts` 제거
- [ ] `useStudentCalendarApi.ts` 제거

### Phase 2: Redux Slice 정리

- [ ] `principalSlice`에서 서버 상태 관련 액션 제거
- [ ] `studentSlice`에서 서버 상태 관련 액션 제거
- [ ] `teacherSlice`에서 서버 상태 관련 액션 제거
- [ ] `calendarSyncMiddleware`를 React Query Mutation으로 마이그레이션

### Phase 3: 최종 정리

- [ ] 사용되지 않는 Redux 액션 타입 제거
- [ ] 사용되지 않는 Redux selector 제거
- [ ] 관련 타입 정의 정리
