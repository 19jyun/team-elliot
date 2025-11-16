# 네비게이션 아키텍처 핵심 파일 정리

이 문서는 Virtual History, NavigationContext, GoBackManager, 그리고 서브페이지/컨테이너 처리 관련 핵심 파일들을 체계적으로 정리한 문서입니다.

---

## 📋 목차

1. [핵심 네비게이션 파일](#1-핵심-네비게이션-파일)
2. [Virtual History 관리](#2-virtual-history-관리)
3. [뒤로가기 처리](#3-뒤로가기-처리)
4. [서브페이지 렌더링](#4-서브페이지-렌더링)
5. [컨테이너 컴포넌트](#5-컨테이너-컴포넌트)
6. [타입 정의](#6-타입-정의)
7. [이벤트 및 상태 동기화](#7-이벤트-및-상태-동기화)
8. [아키텍처 흐름도](#8-아키텍처-흐름도)

---

## 1. 핵심 네비게이션 파일

### 1.1 NavigationContext

**경로**: `frontend/src/contexts/navigation/NavigationContext.tsx`

**역할**:

- 네비게이션 관련 UI 상태 관리 (activeTab, subPage, isTransitioning)
- 서브페이지 열기/닫기 (`navigateToSubPage`, `clearSubPage`)
- 탭 변경 처리 (`handleTabChange`)
- GoBackManager와의 통합 (Virtual History 작업 위임)

**주요 메서드**:

```typescript
navigateToSubPage(page: string)      // 서브페이지 열기
clearSubPage()                        // 서브페이지 닫기
handleTabChange(tab: number)          // 탭 변경
getGoBackManager()                    // GoBackManager 인스턴스 반환
```

**책임**:

- ✅ UI 상태 관리 (SoC)
- ✅ GoBackManager에 Virtual History 작업 위임 (SSOT)
- ✅ StateSync를 통한 상태 발행
- ✅ 이벤트 버스를 통한 상태 변경 알림

---

### 1.2 GoBackManager

**경로**: `frontend/src/contexts/navigation/GoBackManager.ts`

**역할**:

- Virtual History의 Single Source of Truth (SSOT)
- 뒤로가기 로직의 Chain of Responsibility 구현
- 서브페이지 및 폼 단계의 Virtual History 관리

**주요 메서드**:

```typescript
// Public API
pushSubPage(subPage: string, activeTab: number)        // 서브페이지 추가
closeSubPage(subPage: string | null)                    // 서브페이지 닫기
clearHistory()                                          // 전체 히스토리 클리어
pushFormStep(formType: string, formStep: string)        // 폼 단계 추가
executeGoBackWithState(navigationState, formsState)     // 뒤로가기 실행
getInstance()                                            // 싱글톤 인스턴스 반환

// Private (Chain of Responsibility)
handleGoBack(context, formsState)                       // 뒤로가기 체인 실행
handleFormStepBack(previousEntry, formsState)          // 폼 단계 뒤로가기
isFirstStepOfCurrentContainer(context, formsState)     // 첫 단계 확인
```

**Chain of Responsibility 흐름**:

1. **Chain 1**: form-step 확인 (컨테이너 내부 단계별 뒤로가기)
2. **Chain 2**: 컨테이너 첫 단계 확인 (서브페이지 닫기)
3. **Chain 3**: Virtual History의 subpage 확인 (이전 서브페이지로 이동)
4. **Chain 4**: 현재 서브페이지 닫기
5. **Chain 5**: 더 이상 뒤로갈 수 없음

**책임**:

- ✅ Virtual History의 유일한 관리자 (SSOT)
- ✅ 복잡한 뒤로가기 로직의 중앙화 (SoC)
- ✅ Chain of Responsibility 패턴 구현

---

### 1.3 BackButtonHandler

**경로**: `frontend/src/contexts/navigation/BackButtonHandler.ts`

**역할**:

- 브라우저 `popstate` 이벤트와 Capacitor `backButton` 이벤트의 통합 진입점
- 중복 호출 방지 (`isHandling` 플래그)
- GoBackManager에 실제 뒤로가기 로직 위임

**주요 메서드**:

```typescript
handleBackButton(
  canGoBack?: boolean,
  navigationState?: NavigationState,
  formsState?: FormsState
)  // 뒤로가기 처리 (단일 진입점)
```

**책임**:

- ✅ 모든 뒤로가기 이벤트의 단일 진입점 (SSOT)
- ✅ 중복 호출 방지
- ✅ GoBackManager에 로직 위임 (SoC)

---

### 1.4 VirtualHistoryManager

**경로**: `frontend/src/contexts/navigation/VirtualHistoryManager.ts`

**역할**:

- 경량화된 인메모리 히스토리 스택 관리
- 서브페이지 및 폼 단계의 히스토리 엔트리 저장
- 현재 인덱스 추적 및 앞/뒤 이동 지원

**주요 메서드**:

```typescript
push(entry); // 엔트리 추가
goBack(); // 이전 엔트리로 이동
goForward(); // 다음 엔트리로 이동
canGoBack(); // 뒤로가기 가능 여부
canGoForward(); // 앞으로가기 가능 여부
getCurrentEntry(); // 현재 엔트리 조회
getPreviousEntry(); // 이전 엔트리 조회
clear(); // 전체 히스토리 클리어
subscribe(listener); // 상태 변경 구독
```

**데이터 구조**:

```typescript
interface HistoryEntry {
  id: string;
  timestamp: number;
  type: "navigation" | "form-step" | "subpage";
  data: {
    subPage?: string | null;
    activeTab?: number;
    formType?: string;
    formStep?: string;
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}
```

**책임**:

- ✅ 히스토리 스택의 데이터 구조 관리
- ✅ 인덱스 기반 네비게이션 지원
- ✅ Observer 패턴을 통한 상태 변경 알림

---

## 2. Virtual History 관리

### 2.1 Virtual History 추가 흐름

```
사용자 액션
    ↓
NavigationContext.navigateToSubPage()
    ↓
GoBackManager.pushSubPage()  [SSOT]
    ↓
VirtualHistoryManager.push()
    ↓
StateSync.publish('navigation')
    ↓
이벤트 버스: navigationChanged
```

### 2.2 Virtual History 제거 흐름

```
뒤로가기 버튼 클릭
    ↓
BackButtonHandler.handleBackButton()
    ↓
GoBackManager.executeGoBackWithState()
    ↓
GoBackManager.closeSubPage()  [SSOT]
    ↓
VirtualHistoryManager에서 엔트리 제거
    ↓
StateSync.publish('navigation')
    ↓
이벤트 버스: subPageClosed
    ↓
NavigationContext: subPage 상태를 null로 업데이트
```

---

## 3. 뒤로가기 처리

### 3.1 AppContext (이벤트 리스너 등록)

**경로**: `frontend/src/contexts/AppContext.tsx`

**역할**:

- 브라우저 `popstate` 이벤트 리스너 등록
- Capacitor `backButton` 이벤트 리스너 등록
- BackButtonHandler에 이벤트 위임

**주요 코드**:

```typescript
// 브라우저 popstate 리스너
useEffect(() => {
  const handleBrowserBackButton = (event: PopStateEvent) => {
    const navigationState = navigationRef.current?.getNavigationState();
    const formsState = formsStateRef.current;

    backButtonHandler.handleBackButton(undefined, navigationState, formsState);

    // 브라우저 히스토리 동기화
    window.history.replaceState(
      { preventBack: true },
      "",
      window.location.href
    );
  };

  window.addEventListener("popstate", handleBrowserBackButton);
  return () => window.removeEventListener("popstate", handleBrowserBackButton);
}, [backButtonHandler]);

// Capacitor backButton 리스너
useEffect(() => {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) {
    return;
  }

  const listener = App.addListener("backButton", () => {
    const navigationState = navigationRef.current?.getNavigationState();
    const formsState = formsStateRef.current;
    const canGoBack = navigationRef.current?.canGoBack() ?? false;

    backButtonHandler.handleBackButton(canGoBack, navigationState, formsState);
  });

  return () => listener.remove();
}, [backButtonHandler]);
```

**책임**:

- ✅ 브라우저 및 네이티브 뒤로가기 이벤트 수집
- ✅ BackButtonHandler에 이벤트 위임
- ✅ useRef를 통한 최신 상태 접근 (리스너 재등록 방지)

---

## 4. 서브페이지 렌더링

### 4.1 Dashboard 페이지들

**경로**:

- `frontend/src/components/dashboard/StudentDashboardPage.tsx`
- `frontend/src/components/dashboard/PrincipalDashboardPage.tsx`
- `frontend/src/components/dashboard/TeacherDashboardPage.tsx`

**역할**:

- 역할별 대시보드 렌더링
- 서브페이지 조건부 렌더링
- DashboardContainer와의 통합

**주요 코드** (StudentDashboardPage 예시):

```typescript
function StudentDashboardContent() {
  const { navigation } = useApp();
  const { activeTab, handleTabChange, subPage, isTransitioning } = navigation;

  const renderSubPage = () => {
    if (!subPage) return null;

    // 수강 변경 관련 SubPage (modify-*)
    if (subPage.startsWith("modify-")) {
      return <EnrollmentSubPageRenderer page={subPage} />;
    }

    // 월별 수강신청 SubPage (enroll-*)
    if (subPage.startsWith("enroll-")) {
      return <EnrollmentSubPageRenderer page={subPage} />;
    }

    switch (subPage) {
      case "enroll":
        return <EnrollmentContainer />;
      case "enrolled-classes":
        return <EnrolledClassesContainer />;
      case "enrollment-history":
        return <EnrollmentHistory />;
      case "withdrawal":
        return <WithdrawalPage />;
      // ... 기타 서브페이지들
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-safe">
      <CommonHeader />
      <main className="flex-1 overflow-hidden relative">
        {/* DashboardContainer - 항상 렌더링 */}
        <DashboardContainer
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isTransitioning={isTransitioning}
        >
          {tabPages}
        </DashboardContainer>

        {/* SubPage 오버레이 */}
        {subPage && (
          <div className="absolute inset-0 bg-white z-10">
            <div className="w-full h-full overflow-y-auto overflow-x-hidden">
              {renderSubPage()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

**책임**:

- ✅ 역할별 서브페이지 라우팅
- ✅ 서브페이지 조건부 렌더링
- ✅ 오버레이 레이어 관리

---

### 4.2 EnrollmentSubPageRenderer

**경로**: `frontend/src/components/dashboard/student/Enrollment/EnrollmentSubPageRenderer.tsx`

**역할**:

- `modify-*` 및 `enroll-*` 패턴의 서브페이지를 적절한 컨테이너로 라우팅
- 동적 파라미터 파싱 (classId, month 등)

**주요 코드**:

```typescript
export function EnrollmentSubPageRenderer({
  page,
}: EnrollmentSubPageRendererProps) {
  if (page === "enroll") {
    return <EnrollmentContainer />;
  }

  const isModification = page.startsWith("modify-");

  if (isModification) {
    const parts = page.replace("modify-", "").split("-");
    const classId = parseInt(parts[0]);
    const month = parts.length > 1 ? parseInt(parts[1]) : null;
    return <EnrollmentModificationContainer classId={classId} month={month} />;
  }

  // 기존 수강신청 (enroll-8 형태)
  return <EnrollmentContainer />;
}
```

**책임**:

- ✅ 동적 서브페이지 라우팅
- ✅ URL 파라미터 파싱
- ✅ 적절한 컨테이너 컴포넌트 반환

---

### 4.3 DashboardContainer

**경로**: `frontend/src/components/dashboard/DashboardContainer.tsx`

**역할**:

- 탭 기반 페이지 전환 관리
- 스크롤 위치 보존
- 스와이프 제스처 지원

**주요 기능**:

- 각 탭의 스크롤 위치를 개별적으로 관리
- `ScrollableContentContainer`와 통합
- 전환 애니메이션 지원

---

## 5. 컨테이너 컴포넌트

### 5.1 EnrollmentContainer

**경로**: `frontend/src/components/dashboard/student/Enrollment/enroll/EnrollmentContainer.tsx`

**역할**:

- 수강 신청 프로세스의 컨테이너
- 단계별 컴포넌트 렌더링 (academy-selection → class-selection → date-selection → payment → complete)

**주요 코드**:

```typescript
export function EnrollmentContainer() {
  const { form } = useApp();
  const { enrollment } = form;
  const { currentStep } = enrollment;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "academy-selection":
        return <EnrollmentAcademyStep />;
      case "class-selection":
        return <EnrollmentClassStep />;
      case "date-selection":
        return <EnrollmentDateStep />;
      case "payment":
        return <EnrollmentPaymentStep />;
      case "complete":
        return <EnrollmentCompleteStep />;
      default:
        return <EnrollmentAcademyStep />;
    }
  };

  return (
    <div className="w-full h-full overflow-hidden">{renderCurrentStep()}</div>
  );
}
```

**Virtual History 연동**:

- 각 단계 변경 시 `GoBackManager.pushFormStep()` 호출 (NavigationContext에서 자동 처리)
- 첫 단계(`academy-selection`)에서 뒤로가기 시 서브페이지 닫기
- 이후 단계에서 뒤로가기 시 이전 단계로 이동

---

### 5.2 EnrollmentModificationContainer

**경로**: `frontend/src/components/dashboard/student/Enrollment/modify/EnrollmentModificationContainer.tsx`

**역할**:

- 수강 변경/환불 프로세스의 컨테이너
- 단계별 컴포넌트 렌더링 (date-selection → payment/refund-request → refund-complete/complete)

**주요 단계**:

- `date-selection`: 변경할 세션 선택
- `payment`: 추가 결제 (필요 시)
- `refund-request`: 환불 신청
- `refund-complete`: 환불 완료
- `complete`: 변경 완료

**Virtual History 연동**:

- 각 단계 변경 시 `GoBackManager.pushFormStep()` 호출
- 첫 단계(`date-selection`)에서 뒤로가기 시 서브페이지 닫기
- 이후 단계에서 뒤로가기 시 이전 단계로 이동

---

### 5.3 기타 컨테이너들

**CreateClassContainer**

- **경로**: `frontend/src/components/dashboard/principal/class_management/create-class/containers/CreateClassContainer.tsx`
- **역할**: 클래스 생성 프로세스 컨테이너

**EnrolledClassesContainer**

- **경로**: `frontend/src/components/dashboard/student/EnrolledClasses/EnrolledClassesContainer.tsx`
- **역할**: 수강 중인 클래스 목록 컨테이너

**EnrollmentRefundManagementContainer**

- **경로**: `frontend/src/components/dashboard/principal/person_management/enrollment_refund_management/containers/EnrollmentRefundManagementContainer.tsx`
- **역할**: 원장의 수강/환불 관리 컨테이너

---

## 6. 타입 정의

### 6.1 NavigationTypes

**경로**: `frontend/src/contexts/types/NavigationTypes.ts`

**주요 타입**:

```typescript
// 네비게이션 아이템
interface NavigationItem {
  id?: string;
  label: string;
  href?: string;
  path?: string;
  index: number;
  icon?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  children?: NavigationItem[];
}

// 히스토리 엔트리
interface HistoryItem {
  id: string;
  timestamp: number;
  type: "navigation" | "form-step" | "subpage";
  data: {
    subPage?: string | null;
    activeTab?: number;
    formType?: string;
    formStep?: string;
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}

// 뒤로가기 컨텍스트
interface GoBackContext {
  subPage: string | null;
  activeTab: number;
  formStates: {
    enrollment?: { currentStep: string };
    createClass?: { currentStep: string };
    auth?: { currentStep: string };
    personManagement?: { currentStep: string };
    principalPersonManagement?: { currentStep: string };
  };
  history: HistoryItem[];
  currentHistoryIndex: number;
}

// 뒤로가기 결과
interface GoBackResult {
  success: boolean;
  action: "navigate" | "close" | "step-back" | "history-back" | "none";
  data?: {
    entry?: HistoryItem;
    subPage?: string | null;
    activeTab?: number;
    formType?: string;
    step?: string;
    [key: string]: unknown;
  };
  message?: string;
  shouldPreventDefault?: boolean;
}
```

---

### 6.2 StateSyncTypes

**경로**: `frontend/src/contexts/state/StateSyncTypes.ts`

**주요 타입**:

```typescript
// 전역 상태 타입
interface GlobalState {
  navigation: NavigationState;
  forms: FormsState;
}

// 네비게이션 상태
interface NavigationState {
  activeTab: number;
  subPage: string | null;
  canGoBack: boolean;
  isTransitioning: boolean;
  navigationItems: NavigationItem[];
  history: HistoryItem[];
}

// 폼 상태
interface FormsState {
  enrollment: EnrollmentFormState;
  enrollmentModification: EnrollmentModificationFormState;
  createClass: CreateClassFormState;
  principalCreateClass: PrincipalCreateClassFormState;
  auth: AuthFormState;
  personManagement: PersonManagementFormState;
  principalPersonManagement: PrincipalPersonManagementFormState;
}
```

---

## 7. 이벤트 및 상태 동기화

### 7.1 EventTypes

**경로**: `frontend/src/contexts/types/EventTypes.ts`

**주요 이벤트**:

```typescript
interface EventMap {
  navigationChanged: { subPage: string | null; activeTab: number };
  tabChanged: { activeTab: number };
  subPageClosed: { subPage: string | null; activeTab: number };
  formStepChanged: { formType: string; formStep: string };
}
```

---

### 7.2 StateSyncContext

**경로**: `frontend/src/contexts/state/StateSyncContext.tsx`

**역할**:

- 전역 상태의 Pub/Sub 패턴 구현
- NavigationState와 FormsState의 동기화
- 컨텍스트 간 상태 공유

**주요 메서드**:

```typescript
subscribe<T>(key: T, callback: StateListener<T>)  // 상태 구독
publish<T>(key: T, state: StateValue<T>)          // 상태 발행
getState<T>(key: T)                               // 상태 조회
syncStates(states: Partial<GlobalState>)          // 여러 상태 동기화
clearState(key: StateKey)                        // 개별 상태 클리어
clearAllStates()                                  // 모든 상태 클리어
```

---

## 8. 아키텍처 흐름도

### 8.1 서브페이지 열기 흐름

```
사용자 클릭 (서브페이지 열기)
    ↓
[Component] navigateToSubPage('enrollment-history') 호출
    ↓
[NavigationContext] navigateToSubPage()
    ├─ setSubPageState('enrollment-history')
    ├─ GoBackManager.pushSubPage() [SSOT]
    │   └─ VirtualHistoryManager.push()
    ├─ StateSync.publish('navigation')
    └─ EventBus.emit('navigationChanged')
    ↓
[DashboardPage] renderSubPage() → <EnrollmentHistory />
    ↓
[UI] 서브페이지 오버레이 렌더링
```

---

### 8.2 뒤로가기 버튼 클릭 흐름

```
브라우저 뒤로가기 / Capacitor backButton
    ↓
[AppContext] 이벤트 리스너
    ↓
[BackButtonHandler] handleBackButton()
    ├─ isHandling 플래그 체크 (중복 방지)
    └─ GoBackManager.executeGoBackWithState()
        ↓
[GoBackManager] handleGoBack() - Chain of Responsibility
    ├─ Chain 1: form-step 확인
    │   ├─ 첫 단계가 아님 → 이전 단계로 이동 ✅
    │   └─ 첫 단계임 → Chain 2로
    ├─ Chain 2: 컨테이너 첫 단계 확인
    │   └─ 첫 단계임 → 서브페이지 닫기 ✅
    ├─ Chain 3: Virtual History의 subpage 확인
    │   └─ 이전 subpage 있음 → 이전 서브페이지로 이동 ✅
    ├─ Chain 4: 현재 서브페이지 닫기
    │   └─ 서브페이지 있음 → 서브페이지 닫기 ✅
    └─ Chain 5: 더 이상 뒤로갈 수 없음
        ↓
[GoBackManager] closeSubPage() 또는 handleFormStepBack()
    ├─ VirtualHistoryManager에서 엔트리 제거/이동
    ├─ StateSync.publish('forms') (폼 단계 변경 시)
    ├─ StateSync.publish('navigation')
    └─ EventBus.emit('subPageClosed')
        ↓
[NavigationContext] subPageClosed 이벤트 구독
    ├─ setSubPageState(null)
    └─ StateSync.publish('navigation')
        ↓
[DashboardPage] renderSubPage() → null
    ↓
[UI] 서브페이지 오버레이 제거
```

---

### 8.3 컨테이너 내부 단계 변경 흐름

```
사용자 액션 (다음 단계로 이동)
    ↓
[FormManager] setCurrentStep('payment')
    ↓
[FormsContext] 상태 업데이트
    ├─ StateSync.publish('forms')
    └─ EventBus.emit('formStepChanged')
        ↓
[NavigationContext] formStepChanged 이벤트 구독
    └─ GoBackManager.pushFormStep() [SSOT]
        └─ VirtualHistoryManager.push()
            ↓
[Container] renderCurrentStep() → <EnrollmentPaymentStep />
    ↓
[UI] 새로운 단계 렌더링
```

---

## 9. 설계 원칙 준수

### 9.1 Single Source of Truth (SSOT)

| 데이터          | SSOT 위치                                                   |
| --------------- | ----------------------------------------------------------- |
| Virtual History | `GoBackManager` (VirtualHistoryManager 인스턴스 소유)       |
| NavigationState | `NavigationContext` (로컬 상태) + `StateSync` (전역 동기화) |
| FormsState      | `FormsContext` (로컬 상태) + `StateSync` (전역 동기화)      |
| 뒤로가기 진입점 | `BackButtonHandler`                                         |

---

### 9.2 Separation of Concerns (SoC)

| 계층                      | 책임                                                          |
| ------------------------- | ------------------------------------------------------------- |
| **UI Layer**              | 서브페이지/컨테이너 렌더링, 사용자 인터랙션                   |
| **NavigationContext**     | 네비게이션 UI 상태 관리, GoBackManager 위임                   |
| **GoBackManager**         | Virtual History 관리, 뒤로가기 로직 (Chain of Responsibility) |
| **BackButtonHandler**     | 뒤로가기 이벤트 통합, 중복 방지                               |
| **VirtualHistoryManager** | 히스토리 스택 데이터 구조 관리                                |
| **StateSync**             | 전역 상태 Pub/Sub 패턴                                        |
| **EventBus**              | 컨텍스트 간 이벤트 통신                                       |

---

### 9.3 Chain of Responsibility

**GoBackManager.handleGoBack()**에서 구현:

1. **Chain 1**: form-step 확인 (컨테이너 내부 단계별 뒤로가기)
2. **Chain 2**: 컨테이너 첫 단계 확인 (서브페이지 닫기)
3. **Chain 3**: Virtual History의 subpage 확인 (이전 서브페이지로 이동)
4. **Chain 4**: 현재 서브페이지 닫기
5. **Chain 5**: 더 이상 뒤로갈 수 없음

각 체인은 명확한 조건과 책임을 가지며, 조건에 맞지 않으면 다음 체인으로 넘어갑니다.

---

## 10. 주요 파일 목록

### 핵심 네비게이션 파일

- ✅ `frontend/src/contexts/navigation/NavigationContext.tsx`
- ✅ `frontend/src/contexts/navigation/GoBackManager.ts`
- ✅ `frontend/src/contexts/navigation/BackButtonHandler.ts`
- ✅ `frontend/src/contexts/navigation/VirtualHistoryManager.ts`

### 상태 및 이벤트 관리

- ✅ `frontend/src/contexts/AppContext.tsx`
- ✅ `frontend/src/contexts/state/StateSyncContext.tsx`
- ✅ `frontend/src/contexts/state/StateSyncTypes.ts`
- ✅ `frontend/src/contexts/types/EventTypes.ts`
- ✅ `frontend/src/contexts/types/NavigationTypes.ts`

### 서브페이지 렌더링

- ✅ `frontend/src/components/dashboard/StudentDashboardPage.tsx`
- ✅ `frontend/src/components/dashboard/PrincipalDashboardPage.tsx`
- ✅ `frontend/src/components/dashboard/TeacherDashboardPage.tsx`
- ✅ `frontend/src/components/dashboard/DashboardContainer.tsx`
- ✅ `frontend/src/components/dashboard/student/Enrollment/EnrollmentSubPageRenderer.tsx`

### 컨테이너 컴포넌트

- ✅ `frontend/src/components/dashboard/student/Enrollment/enroll/EnrollmentContainer.tsx`
- ✅ `frontend/src/components/dashboard/student/Enrollment/modify/EnrollmentModificationContainer.tsx`
- ✅ `frontend/src/components/dashboard/principal/class_management/create-class/containers/CreateClassContainer.tsx`
- ✅ `frontend/src/components/dashboard/student/EnrolledClasses/EnrolledClassesContainer.tsx`
- ✅ `frontend/src/components/dashboard/principal/person_management/enrollment_refund_management/containers/EnrollmentRefundManagementContainer.tsx`

### 폼 관리

- ✅ `frontend/src/contexts/forms/FormsContext.tsx`
- ✅ `frontend/src/contexts/forms/EnrollmentFormManager.ts`
- ✅ `frontend/src/contexts/forms/EnrollmentModificationFormManager.ts`
- ✅ `frontend/src/contexts/forms/CreateClassFormManager.ts`
- ✅ `frontend/src/contexts/forms/PrincipalCreateClassFormManager.ts`

---

## 11. 참고사항

### 11.1 Virtual History 규칙

- Virtual History에는 **서브페이지만** 저장됨 (대시보드 제외)
- Virtual History가 비어 있으면 사용자는 대시보드를 보고 있음
- 서브페이지를 닫는 방법:
  1. 뒤로가기 버튼
  2. 헤더의 네비게이션 탭에서 다른 탭 선택
  3. 컨테이너의 전체 프로세스 완료

### 11.2 컨테이너 첫 단계 확인

다음 컨테이너들의 첫 단계:

- `enrollment`: `academy-selection`
- `enrollmentModification` (modify-\*): `date-selection`
- `createClass`: `info`
- `principalCreateClass`: `info`
- `personManagement`: `class-list`
- `principalPersonManagement`: `class-list`

### 11.3 새로운 컨테이너 추가 시

1. `GoBackManager.isFirstStepOfCurrentContainer()`에 케이스 추가
2. `GoBackManager.handleFormStepBack()`에 formType 케이스 추가
3. 해당 FormManager에서 단계 변경 시 `pushFormStep()` 호출 확인 (NavigationContext에서 자동 처리)

---

**마지막 업데이트**: 2025-01-16
