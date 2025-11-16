# 실시간 업데이트 아키텍처

## 📋 개요

Socket.IO를 통한 실시간 이벤트와 React Query의 캐시 무효화를 통합하여 실시간 업데이트를 구현합니다.

---

## 🏗️ 아키텍처 구조

```
┌─────────────────┐
│  Backend Server │
│  (Socket.IO)    │
└────────┬────────┘
         │ Socket Event
         │ (enrollment_accepted, refund_accepted 등)
         ▼
┌─────────────────────────────────────┐
│  RoleBasedSocketListener           │
│  (역할별 리스너 컴포넌트)           │
└────────┬────────────────────────────┘
         │
         ├─► PrincipalSocketListener
         ├─► TeacherSocketListener
         └─► StudentSocketListener
         │
         ▼
┌─────────────────────────────────────┐
│  SocketQuerySync                    │
│  (Socket 이벤트 → React Query 변환)  │
└────────┬────────────────────────────┘
         │
         │ invalidateQueries()
         ▼
┌─────────────────────────────────────┐
│  React Query Cache                  │
│  (자동 리패칭)                      │
└────────┬────────────────────────────┘
         │
         │ refetch()
         ▼
┌─────────────────────────────────────┐
│  Components                         │
│  (자동 UI 업데이트)                  │
└─────────────────────────────────────┘
```

---

## 🔄 실시간 업데이트 플로우

### 1. Socket 이벤트 수신

**파일**: `frontend/src/components/common/Socket/RoleBasedSocketListener.tsx`

역할에 따라 적절한 리스너 컴포넌트가 마운트됩니다:

```typescript
// 역할별 리스너 매핑
const roleListeners = {
  PRINCIPAL: PrincipalSocketListener,
  TEACHER: TeacherSocketListener,
  STUDENT: StudentSocketListener,
};
```

### 2. Socket 이벤트 처리

**파일**: `frontend/src/components/common/Socket/PrincipalSocketListener.tsx`

각 리스너는 `useSocketEvent` hook을 사용하여 Socket 이벤트를 구독합니다:

```typescript
export function PrincipalSocketListener() {
  const queryClient = useQueryClient();
  const socketSync = new SocketQuerySync(queryClient);

  // 새로운 수강신청 요청 알림
  useSocketEvent("new_enrollment_request", (data) => {
    // React Query 캐시 무효화
    socketSync.handleSocketEvent("new_enrollment_request", data);

    // 사용자에게 알림
    toast.info("새로운 수강 신청이 도착했습니다.");
  });
}
```

### 3. React Query 캐시 무효화

**파일**: `frontend/src/lib/socket/socketQuerySync.ts`

`SocketQuerySync` 클래스가 Socket 이벤트를 받아서 관련된 React Query 캐시를 무효화합니다:

```typescript
export class SocketQuerySync {
  handleSocketEvent(event: SocketEventName, data: SocketEventData) {
    switch (event) {
      case "new_enrollment_request":
        // Principal 수강신청 목록 무효화
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.enrollments.lists(),
        });
        break;

      case "enrollment_accepted":
      case "enrollment_rejected":
        // Principal 수강신청 목록 무효화
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.principal.enrollments.lists(),
        });

        // Student 측 캐시도 무효화
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.student.enrollmentHistory.lists(),
        });

        // 캘린더 세션 무효화
        this.queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return key.includes("calendarSessions");
          },
        });
        break;
    }
  }
}
```

### 4. 자동 리패칭 및 UI 업데이트

React Query가 캐시가 무효화되면:

1. 해당 쿼리를 사용하는 컴포넌트가 자동으로 리패칭을 트리거합니다
2. 새로운 데이터를 가져와서 캐시를 업데이트합니다
3. 컴포넌트가 자동으로 리렌더링되어 최신 데이터를 표시합니다

---

## 📡 지원하는 Socket 이벤트

### 수강신청 관련

- `new_enrollment_request` - 새로운 수강신청 요청
- `enrollment_accepted` - 수강신청 승인
- `enrollment_rejected` - 수강신청 거절

### 환불 요청 관련

- `new_refund_request` - 새로운 환불 요청
- `refund_accepted` - 환불 요청 승인
- `refund_rejected` - 환불 요청 거절

### 세션 관련

- `session_created` - 세션 생성
- `session_updated` - 세션 업데이트
- `session_deleted` - 세션 삭제

### 선생님 가입 신청 관련

- `teacher_join_request` - 선생님 가입 신청
- `teacher_join_approved` - 선생님 가입 승인
- `teacher_join_rejected` - 선생님 가입 거절

---

## 🎯 캐시 무효화 전략

### 1. 특정 쿼리 키 무효화

```typescript
// 수강신청 목록 무효화
this.queryClient.invalidateQueries({
  queryKey: queryKeys.principal.enrollments.lists(),
});
```

### 2. 패턴 기반 무효화

```typescript
// 모든 캘린더 세션 쿼리 무효화
this.queryClient.invalidateQueries({
  predicate: (query) => {
    const key = query.queryKey;
    return key.includes("calendarSessions");
  },
});
```

### 3. 다중 쿼리 무효화

하나의 Socket 이벤트로 여러 관련 쿼리를 동시에 무효화할 수 있습니다:

```typescript
case "enrollment_accepted":
  // Principal 측
  this.queryClient.invalidateQueries({
    queryKey: queryKeys.principal.enrollments.lists(),
  });

  // Student 측
  this.queryClient.invalidateQueries({
    queryKey: queryKeys.student.enrollmentHistory.lists(),
  });

  // 캘린더 세션
  this.queryClient.invalidateQueries({
    predicate: (query) => query.queryKey.includes("calendarSessions"),
  });
```

---

## 🔍 예시: 수강신청 승인 플로우

### 1. 원장이 수강신청 승인

```
Principal → API 호출 → Backend
```

### 2. Backend가 Socket 이벤트 발송

```
Backend → Socket.IO → enrollment_accepted 이벤트 발송
```

### 3. StudentSocketListener가 이벤트 수신

```typescript
useSocketEvent("enrollment_accepted", (data) => {
  socketSync.handleSocketEvent("enrollment_accepted", data);
  toast.success("수강 신청이 승인되었습니다!");
});
```

### 4. SocketQuerySync가 캐시 무효화

```typescript
case "enrollment_accepted":
  // Student 수강 내역 무효화
  this.queryClient.invalidateQueries({
    queryKey: queryKeys.student.enrollmentHistory.lists(),
  });

  // 캘린더 세션 무효화
  this.queryClient.invalidateQueries({
    predicate: (query) => query.queryKey.includes("calendarSessions"),
  });
```

### 5. React Query 자동 리패칭

- `useStudentEnrollmentHistory` hook이 자동으로 리패칭
- `useStudentCalendarSessions` hook이 자동으로 리패칭
- 컴포넌트가 최신 데이터로 자동 업데이트

---

## 💡 장점

### 1. 자동 동기화

- Socket 이벤트만 수신하면 자동으로 관련 데이터가 업데이트됩니다
- 수동 API 호출이 필요 없습니다

### 2. 일관성 보장

- 모든 관련 쿼리가 동시에 무효화되어 데이터 일관성이 보장됩니다
- 캐시와 서버 상태가 항상 동기화됩니다

### 3. 성능 최적화

- 필요한 쿼리만 리패칭합니다
- React Query의 캐싱 전략을 활용합니다

### 4. 확장성

- 새로운 Socket 이벤트를 쉽게 추가할 수 있습니다
- `SocketQuerySync`에 새로운 케이스만 추가하면 됩니다

---

## 🔧 확장 방법

### 새로운 Socket 이벤트 추가

1. **Socket 이벤트 타입 정의** (`frontend/src/types/socket.ts`)

```typescript
export type SocketEventName =
  | "new_enrollment_request"
  | "enrollment_accepted"
  | "your_new_event"; // 새 이벤트 추가
```

2. **SocketQuerySync에 처리 로직 추가** (`frontend/src/lib/socket/socketQuerySync.ts`)

```typescript
case "your_new_event":
  this.queryClient.invalidateQueries({
    queryKey: queryKeys.yourDomain.yourResource.lists(),
  });
  break;
```

3. **리스너 컴포넌트에 이벤트 구독 추가**

```typescript
useSocketEvent("your_new_event", (data) => {
  socketSync.handleSocketEvent("your_new_event", data);
  toast.info("새 이벤트 발생!");
});
```

---

## 📚 관련 파일

- `frontend/src/lib/socket/socketQuerySync.ts` - Socket 이벤트 → React Query 변환
- `frontend/src/components/common/Socket/RoleBasedSocketListener.tsx` - 역할별 리스너 라우팅
- `frontend/src/components/common/Socket/PrincipalSocketListener.tsx` - 원장 리스너
- `frontend/src/components/common/Socket/TeacherSocketListener.tsx` - 선생님 리스너
- `frontend/src/components/common/Socket/StudentSocketListener.tsx` - 학생 리스너
- `frontend/src/hooks/socket/useSocket.ts` - Socket hook
- `frontend/src/lib/react-query/queryKeys.ts` - Query Key 정의
