# 프론트엔드 아키텍처 분석 문서

## 📋 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [상태 관리 계층 구조](#상태-관리-계층-구조)
3. [누락된 컴포넌트 확인](#누락된-컴포넌트-확인)
4. [확장가능성 및 유지보수성 분석](#확장가능성-및-유지보수성-분석)
5. [책임 분리 분석](#책임-분리-분석)
6. [기능적 수정 확인](#기능적-수정-확인)
7. [새 아키텍처 상세 설명](#새-아키텍처-상세-설명)

---

## 아키텍처 개요

### 핵심 원칙
```
서버 상태 = React Query
UI 상태 = Context API
글로벌 비즈니스 상태 = Redux
```

### 레이어 구조
```
┌─────────────────────────────────────────┐
│         Component Layer                │
│  (UI Components, Pages)                │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Custom Hooks Layer                 │
│  (React Query Hooks, Mutations)        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    State Management Layer               │
│  ┌──────────┐  ┌──────────┐  ┌───────┐│
│  │React Query│  │Context API│ │ Redux ││
│  │(서버 상태)│  │(UI 상태)  │ │(비즈니스)││
│  └──────────┘  └──────────┘  └───────┘│
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Real-time Sync Layer                 │
│  (Socket.IO → React Query Cache)       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         API Layer                       │
│  (apiClient, Axios Interceptors)       │
└─────────────────────────────────────────┘
```

---

## 상태 관리 계층 구조

### 1. 서버 상태 관리 (React Query)

**위치**: `frontend/src/hooks/queries/`, `frontend/src/hooks/mutations/`

**책임**:
- 서버에서 가져온 데이터의 캐싱 및 동기화
- 자동 리패칭 및 백그라운드 업데이트
- 낙관적 업데이트 (Optimistic Updates)
- 에러 처리 및 재시도 로직

**구조**:
```
hooks/
├── queries/
│   ├── principal/
│   │   ├── usePrincipalProfile.ts
│   │   ├── usePrincipalAcademy.ts
│   │   ├── usePrincipalClasses.ts
│   │   ├── usePrincipalTeachers.ts
│   │   ├── usePrincipalStudents.ts
│   │   ├── usePrincipalEnrollments.ts
│   │   ├── usePrincipalRefundRequests.ts
│   │   ├── usePrincipalCalendarSessions.ts
│   │   ├── usePrincipalSessionEnrollments.ts
│   │   └── useTeacherJoinRequests.ts
│   ├── teacher/
│   │   ├── useTeacherProfile.ts
│   │   ├── useTeacherClasses.ts
│   │   └── useTeacherCalendarSessions.ts
│   └── student/
│       ├── useStudentProfile.ts
│       ├── useStudentAcademies.ts
│       ├── useStudentEnrollmentHistory.ts
│       ├── useStudentCancellationHistory.ts
│       ├── useStudentCalendarSessions.ts
│       ├── useStudentAvailableSessions.ts
│       └── useStudentRefundAccount.ts
└── mutations/
    ├── principal/
    │   ├── useApproveEnrollment.ts
    │   ├── useRejectEnrollment.ts
    │   ├── useApproveRefund.ts
    │   ├── useRejectRefund.ts
    │   ├── useCreatePrincipalClass.ts
    │   ├── useUpdatePrincipalProfile.ts
    │   ├── useUpdatePrincipalProfilePhoto.ts
    │   ├── useUpdatePrincipalAcademy.ts
    │   ├── useRemoveTeacher.ts
    │   ├── useRemoveStudent.ts
    │   ├── useApproveTeacherJoin.ts
    │   └── useRejectTeacherJoin.ts
    ├── teacher/
    │   ├── useUpdateTeacherProfile.ts
    │   ├── useUpdateTeacherProfilePhoto.ts
    │   ├── useUpdateClassDetails.ts
    │   ├── useUpdateSessionSummary.ts
    │   └── useUpdateEnrollmentStatus.ts
    └── student/
        ├── useUpdateStudentProfile.ts
        ├── useUpdateStudentRefundAccount.ts
        ├── useBatchEnrollSessions.ts
        ├── useBatchModifyEnrollments.ts
        ├── useJoinAcademy.ts
        └── useLeaveAcademy.ts
```

**Query Key 관리**: `frontend/src/lib/react-query/queryKeys.ts`
- 중앙 집중식 Query Key 팩토리
- 타입 안전성 보장
- 캐시 무효화 시 일관성 유지

**Query Client 설정**: `frontend/src/lib/react-query/queryClient.ts`
- 전역 설정 (staleTime, gcTime, retry 등)
- React Query v5 호환

**Query Options**: `frontend/src/lib/react-query/queryOptions.ts`
- 재사용 가능한 Query 설정
- `defaultQueryOptions`, `stableQueryOptions`, `realtimeQueryOptions`, `calendarQueryOptions`

### 2. UI 상태 관리 (Context API)

**위치**: `frontend/src/contexts/`

**책임**:
- 모달 열림/닫힘 상태
- 현재 선택된 탭
- 폼 입력값 (임시)
- 네비게이션 상태
- 포커스 관리

**예시**:
- `AppContext`: 전역 UI 상태 (탭, 서브페이지, 폼 상태)
- `CalendarContext`: 캘린더 UI 상태
- 기타 도메인별 Context

### 3. 글로벌 비즈니스 상태 (Redux)

**위치**: `frontend/src/store/slices/`

**책임**:
- 인증 토큰 및 사용자 역할
- 권한 관리
- 캘린더 동기화 큐

**구조**:
```
store/
├── slices/
│   ├── authSlice.ts          # 인증 상태 (토큰, 역할, 사용자 ID)
│   ├── permissionSlice.ts    # 역할별 권한 플래그
│   └── calendarSyncSlice.ts  # 캘린더 동기화 큐
├── middleware/
│   └── calendarSyncMiddleware.ts  # 캘린더 동기화 미들웨어
└── index.ts                  # Store 설정
```

**새로운 Redux 슬라이스**:

#### `authSlice.ts`
- `accessToken`, `refreshToken`: JWT 토큰
- `userRole`: 사용자 역할 (STUDENT | TEACHER | PRINCIPAL)
- `userId`: 사용자 ID
- `isAuthenticated`: 인증 상태
- `expiresAt`: 토큰 만료 시간

#### `permissionSlice.ts`
- 역할별 권한 플래그:
  - `canManageEnrollments`
  - `canManageRefunds`
  - `canManageTeachers`
  - `canManageStudents`
  - `canCreateClasses`
  - `canViewCalendar`
  - `canManageAcademy`
  - `canJoinAcademy`
  - `canRequestRefund`
  - `canEnrollSessions`

#### `calendarSyncSlice.ts`
- `syncQueue`: 디바이스 캘린더 동기화 작업 큐
- `isEnabled`: 동기화 활성화 여부
- `lastSyncTime`: 마지막 동기화 시간
- `isSyncing`: 동기화 진행 중 여부

---

## 누락된 컴포넌트 확인

### ⚠️ 아직 마이그레이션되지 않은 컴포넌트들

#### 1. Principal 관련
- ✅ `PrincipalStudentManagementSection` - 완료
- ✅ `PrincipalTeacherManagementSection` - 완료
- ✅ `PrincipalPersonManagementPage` - 완료
- ✅ `PrincipalClassesContainer` - 완료
- ❌ `PrincipalRequestDetail` - **미완료** (usePrincipalApi 사용)
- ❌ `PrincipalProfileCard` - **미완료** (usePrincipalApi 사용)
- ❌ `PrincipalPersonalInfoManagement` - **미완료** (usePrincipalApi 사용)
- ❌ `PrincipalBankInfoManagement` - **미완료** (usePrincipalApi 사용)
- ❌ `CreateClassStepTeacher` - **미완료** (usePrincipalApi 사용)
- ❌ `CreateClassStepInfo` - **미완료** (usePrincipalApi 사용)
- ❌ `CreateClassStepDetail` - **미완료** (usePrincipalApi 사용)
- ❌ `PrincipalStudentSessionHistoryModal` - **미완료** (usePrincipalApi 사용)

#### 2. Teacher 관련
- ✅ `TeacherPersonalInfoManagement` - 완료
- ✅ `TeacherClassesContainer` - 완료
- ❌ `SessionDetailModal` - **미완료** (usePrincipalApi, useTeacherApi 사용)
- ❌ `AttendanceSummaryComponent` - **미완료** (useTeacherApi 사용)
- ❌ `TeacherProfileCard` - **미완료** (useTeacherApi 사용)
- ❌ `useTeacherAcademyManagement` - **미완료** (useTeacherApi 사용)

#### 3. Student 관련
- ✅ `PersonalInfoManagement` - 완료
- ✅ `AcademyManagement` - 완료
- ✅ `RefundAccountManagement` - 완료
- ✅ `EnrolledClassesContainer` - 완료
- ❌ `EnrollmentAcademyStep` - **미완료** (useStudentApi 사용)
- ❌ `EnrollmentClassStep` - **미완료** (useStudentApi 사용)
- ❌ `EnrollmentDateStep` - **미완료** (useStudentApi 사용)
- ❌ `EnrollmentPaymentStep` - **미완료** (useStudentApi 사용)
- ❌ `EnrollmentModificationContainer` - **미완료** (useStudentApi 사용)
- ❌ `EnrollmentModificationDateStep` - **미완료** (useStudentApi 사용)
- ❌ `EnrollmentModificationPaymentStep` - **미완료** (useStudentApi 사용)
- ❌ `RefundRequestStep` - **미완료** (useStudentApi 사용)
- ❌ `ClassDetail` - **미완료** (useStudentApi 사용)
- ❌ `TeacherProfileCardForStudent` - **미완료** (useStudentApi 사용)
- ❌ `StudentSessionDetailModal` - **미완료** (useStudentApi 사용)

#### 4. Calendar 관련
- ❌ `useTeacherCalendarApi` - **미완료** (Redux 기반)
- ❌ `useRoleCalendarApi` - **미완료** (Redux 기반)
- ❌ `TeacherDashboardPage` (class/page.tsx) - **미완료** (useTeacherCalendarApi 사용)

#### 5. Common 컴포넌트
- ❌ `SessionDetailModal` - **미완료** (usePrincipalApi, useTeacherApi 사용)

### 📊 마이그레이션 진행률
- **완료**: 8개 컴포넌트
- **미완료**: 약 25개 컴포넌트
- **진행률**: 약 24%

---

## 확장가능성 및 유지보수성 분석

### ✅ 강점

#### 1. **명확한 책임 분리**
- 서버 상태, UI 상태, 비즈니스 상태가 명확히 분리됨
- 각 레이어가 독립적으로 동작하여 테스트 및 유지보수 용이

#### 2. **타입 안전성**
- Query Keys가 중앙에서 관리되어 타입 안전성 보장
- TypeScript를 통한 컴파일 타임 에러 검출

#### 3. **재사용 가능한 구조**
- Query Options를 통한 설정 재사용
- Custom Hooks를 통한 로직 재사용

#### 4. **확장 용이성**
- 새로운 API 엔드포인트 추가 시:
  1. `queryKeys.ts`에 키 추가
  2. `hooks/queries/` 또는 `hooks/mutations/`에 훅 생성
  3. 컴포넌트에서 사용

#### 5. **실시간 업데이트 통합**
- Socket 이벤트가 자동으로 React Query 캐시 무효화
- `SocketQuerySync` 클래스를 통한 중앙 관리

### ⚠️ 개선 필요 사항

#### 1. **점진적 마이그레이션 필요**
- 약 25개 컴포넌트가 아직 레거시 API 훅 사용
- 단계적 마이그레이션 계획 필요

#### 2. **레거시 Redux 슬라이스 정리**
- `principalSlice`, `studentSlice`, `teacherSlice`, `uiSlice`는 점진적 제거 예정
- 현재는 새 슬라이스와 병행 사용 중

#### 3. **Calendar 동기화 통합**
- `calendarSyncMiddleware`가 여전히 Redux 액션에 의존
- React Query Mutation과의 통합 필요

---

## 책임 분리 분석

### ✅ 잘 분리된 부분

#### 1. **서버 상태 vs 클라이언트 상태**
```
서버 상태 (React Query):
- 프로필 정보
- 학원 정보
- 클래스 목록
- 수강신청 목록
- 환불 요청 목록
- 캘린더 세션

클라이언트 상태 (Context API):
- 모달 열림/닫힘
- 현재 선택된 탭
- 폼 입력값 (임시)
- 네비게이션 상태
```

#### 2. **비즈니스 로직 vs UI 로직**
```
비즈니스 로직 (Redux):
- 인증 토큰 관리
- 권한 체크
- 캘린더 동기화 큐

UI 로직 (Context API):
- UI 상태 관리
- 포커스 관리
- 애니메이션 상태
```

#### 3. **데이터 페칭 vs 상태 관리**
```
데이터 페칭 (React Query):
- API 호출
- 캐싱
- 리패칭
- 낙관적 업데이트

상태 관리 (Redux/Context):
- 전역 상태
- UI 상태
```

### ⚠️ 개선 필요 부분

#### 1. **Calendar 동기화**
- 현재: Redux Middleware가 Redux 액션에 의존
- 개선: React Query Mutation의 `onSuccess`에서 직접 호출하도록 변경

#### 2. **에러 처리**
- 현재: `apiClient` 인터셉터에서 전역 에러 처리
- 개선: React Query의 `onError`와 통합 필요

---

## 기능적 수정 확인

### ✅ 유지된 기능

#### 1. **데이터 로딩**
- 기존: `useEffect` + `loadXXX()` 함수
- 현재: React Query 자동 로딩
- **기능 유지**: ✅ (자동 로딩으로 개선됨)

#### 2. **캐싱**
- 기존: 수동 상태 관리
- 현재: React Query 자동 캐싱
- **기능 유지**: ✅ (더 나은 캐싱 전략)

#### 3. **실시간 업데이트**
- 기존: Redux 액션 디스패치
- 현재: React Query 캐시 무효화
- **기능 유지**: ✅ (더 효율적인 업데이트)

#### 4. **낙관적 업데이트**
- 기존: 수동 상태 업데이트
- 현재: React Query `onMutate` 사용
- **기능 유지**: ✅ (더 안정적인 롤백)

#### 5. **에러 처리**
- 기존: `useApiError` 훅
- 현재: `apiClient` 인터셉터 + React Query `onError`
- **기능 유지**: ✅ (중앙 집중식 에러 처리)

### ⚠️ 확인 필요 사항

#### 1. **Calendar 동기화**
- 기존: Redux 액션 기반
- 현재: Redux Middleware가 여전히 Redux 액션에 의존
- **확인 필요**: React Query Mutation과의 통합 테스트 필요

#### 2. **세션 상세 모달**
- 기존: `usePrincipalApi`, `useTeacherApi` 사용
- 현재: 아직 마이그레이션되지 않음
- **확인 필요**: 기능 동작 확인 필요

---

## 새 아키텍처 상세 설명

### 1. 데이터 흐름

#### 서버 데이터 조회 흐름
```
Component
  ↓
useQuery Hook (e.g., usePrincipalProfile)
  ↓
Query Key Factory (queryKeys.ts)
  ↓
API Call (apiClient)
  ↓
React Query Cache
  ↓
Component Re-render
```

#### 서버 데이터 변경 흐름
```
User Action
  ↓
useMutation Hook (e.g., useApproveEnrollment)
  ↓
onMutate (낙관적 업데이트)
  ↓
API Call (apiClient)
  ↓
onSuccess (캐시 무효화)
  ↓
자동 리패칭
  ↓
Component Re-render
```

#### 실시간 업데이트 흐름
```
Socket Event
  ↓
SocketListener Component
  ↓
SocketQuerySync.handleSocketEvent()
  ↓
React Query Cache Invalidation
  ↓
자동 리패칭
  ↓
Component Re-render
```

### 2. Query Key 구조

```typescript
queryKeys = {
  principal: {
    all: ["principal"],
    profile: {
      all: ["principal", "profile"],
      detail: () => ["principal", "profile"]
    },
    enrollments: {
      all: ["principal", "enrollments"],
      lists: () => ["principal", "enrollments", "list"],
      list: (filters) => ["principal", "enrollments", "list", filters],
      detail: (id) => ["principal", "enrollments", "detail", id]
    }
  }
}
```

**장점**:
- 계층적 구조로 관리 용이
- 타입 안전성 보장
- 캐시 무효화 시 일관성 유지

### 3. Socket 통합

#### SocketQuerySync 클래스
```typescript
class SocketQuerySync {
  handleSocketEvent(event, data) {
    switch (event) {
      case "enrollment_accepted":
        // 관련 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: queryKeys.principal.enrollments.lists()
        });
        break;
    }
  }
}
```

**장점**:
- 중앙 집중식 이벤트 처리
- 타입 안전한 이벤트 핸들링
- 확장 용이

### 4. 에러 처리 전략

#### 계층적 에러 처리
```
1. API Client Interceptor (전역)
   - 네트워크 에러
   - 인증 에러
   - 서버 에러

2. React Query onError (쿼리별)
   - 쿼리별 커스텀 에러 처리
   - 낙관적 업데이트 롤백

3. Component Level (UI)
   - 사용자 친화적 에러 메시지
   - 재시도 버튼
```

### 5. 캐싱 전략

#### Query Options별 캐싱 전략
```typescript
// 안정적인 데이터 (프로필, 학원 정보)
stableQueryOptions: {
  staleTime: 5분,
  gcTime: 10분
}

// 실시간 데이터 (수강신청, 환불 요청)
realtimeQueryOptions: {
  staleTime: 10초,
  gcTime: 2분
}

// 캘린더 데이터
calendarQueryOptions: {
  staleTime: 2분,
  gcTime: 5분
}
```

---

## 결론 및 권장사항

### ✅ 아키텍처 강점
1. **명확한 책임 분리**: 서버/UI/비즈니스 상태가 명확히 분리됨
2. **확장 용이성**: 새로운 기능 추가가 용이한 구조
3. **타입 안전성**: TypeScript와 Query Keys를 통한 타입 보장
4. **실시간 업데이트**: Socket과 React Query의 효율적 통합

### ⚠️ 개선 필요 사항
1. **남은 컴포넌트 마이그레이션**: 약 25개 컴포넌트 마이그레이션 필요
2. **Calendar 동기화 통합**: React Query Mutation과의 직접 통합 필요
3. **레거시 Redux 정리**: 점진적 제거 계획 필요

### 📋 다음 단계 권장사항
1. **Phase 3**: 남은 컴포넌트 마이그레이션
2. **Phase 4**: Calendar 동기화 통합 개선
3. **Phase 5**: 레거시 Redux 슬라이스 제거
4. **Phase 6**: 통합 테스트 및 문서화

---

**작성일**: 2024년
**버전**: 1.0

