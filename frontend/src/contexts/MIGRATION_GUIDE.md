# Context 아키텍처 마이그레이션 가이드

## 개요

기존의 거대한 AppContext를 분할하고 StateSync 시스템을 도입하여 Context 간 상태 동기화 문제를 해결했습니다.

## 주요 변경사항

### 1. 새로운 아키텍처

```
기존: AppContext (거대한 단일 Context)
새로운: StateSync + 분할된 Context들
```

### 2. Context 구조 변경

```
기존:
AppContext
├── NavigationContext
├── FormsContexts (개별)
├── UIContext
└── DataContext

새로운:
StateSyncProvider
├── ImprovedNavigationProvider
├── ImprovedFormsProvider
├── UIContextProvider
└── DataContextProvider
```

## 마이그레이션 단계

### 1단계: Provider 교체

**기존:**

```tsx
import { AppProvider } from "@/contexts/AppContext";

<AppProvider>{children}</AppProvider>;
```

**새로운:**

```tsx
import { ImprovedAppProvider } from "@/contexts/ImprovedAppContext";

<ImprovedAppProvider>{children}</ImprovedAppProvider>;
```

### 2단계: Hook 교체

**기존:**

```tsx
import { useApp } from "@/contexts/AppContext";

const { activeTab, subPage, goBack, form } = useApp();
```

**새로운:**

```tsx
import { useImprovedApp } from "@/contexts/ImprovedAppContext";

const { activeTab, subPage, goBack, form } = useImprovedApp();
```

### 3단계: 개별 Context 사용 (선택사항)

**기존:**

```tsx
const { activeTab, subPage } = useApp();
```

**새로운:**

```tsx
import { useImprovedNavigation } from "@/contexts/navigation/ImprovedNavigationContext";
import { useImprovedForms } from "@/contexts/forms/ImprovedFormsContext";

const { activeTab, subPage } = useImprovedNavigation();
const { enrollment, createClass } = useImprovedForms();
```

## 호환성 보장

### 1. 하위 호환성 API

기존 코드가 그대로 작동하도록 하위 호환성 API를 제공합니다:

```tsx
// 기존 코드가 그대로 작동
const { activeTab, subPage, goBack, form } = useImprovedApp();

// 기존 메서드들도 그대로 작동
setEnrollmentStep("class-selection");
navigateToSubPage("enroll");
```

### 2. Legacy 메서드 지원

기존의 모든 메서드들이 새로운 구조에서도 작동합니다:

```tsx
// 수강신청 관련
setEnrollmentStep(step);
setSelectedMonth(month);
setSelectedClasses(classes);
resetEnrollment();

// 네비게이션 관련
setActiveTab(tab);
navigateToSubPage(page);
goBack();
```

## 문제 해결

### 1. Academy Selection에서 다음 단계로 넘어가지 않는 문제

**원인:** Context 간 상태 동기화 부재
**해결:** StateSync를 통한 실시간 상태 동기화

```tsx
// 기존 (문제)
const context: GoBackContext = {
  formStates: {
    enrollment: { currentStep: "academy-selection" }, // 하드코딩
  },
};

// 새로운 (해결)
const formsState = stateSync.getState("forms");
const context: GoBackContext = {
  formStates: {
    enrollment: { currentStep: formsState.enrollment.currentStep }, // 실제 상태
  },
};
```

### 2. 뒤로가기 버튼이 서브페이지를 닫지 않는 문제

**원인:** step-back 액션 처리 부재
**해결:** ImprovedGoBackManager에서 실제 폼 상태 업데이트

```tsx
// 기존 (문제)
case "step-back":
  console.log('Form step reverted:', result.data); // 로그만 출력
  break;

// 새로운 (해결)
case "step-back":
  if (result.data?.formType && result.data?.step) {
    const formsState = stateSync.getState('forms');
    if (formsState) {
      const updatedForms = { ...formsState };
      updatedForms[result.data.formType] = {
        ...updatedForms[result.data.formType],
        currentStep: result.data.step
      };
      stateSync.publish('forms', updatedForms);
    }
  }
  break;
```

## 성능 개선

### 1. 불필요한 리렌더링 감소

**기존:**

```tsx
// 모든 Context가 의존성에 포함
const contextValue = useMemo(
  () => ({
    // ...
  }),
  [
    navigation,
    enrollment,
    createClass,
    auth,
    personManagement,
    principalCreateClass,
    principalPersonManagement,
    ui,
    data,
    session,
    getFormState,
    goBackAdvanced,
    resetAllForms,
    updateForm,
  ]
);
```

**새로운:**

```tsx
// 필요한 상태만 구독
const navigation = useImprovedNavigation();
const forms = useImprovedForms();
const ui = useUI();
const data = useData();
```

### 2. 선택적 구독

StateSync를 통해 필요한 상태만 구독할 수 있습니다:

```tsx
const stateSync = useStateSync();

// 특정 상태만 구독
useEffect(() => {
  const unsubscribe = stateSync.subscribe("forms", (formsState) => {
    // forms 상태 변경 시에만 실행
  });
  return unsubscribe;
}, [stateSync]);
```

## 테스트

### 1. 단위 테스트

```tsx
// ImprovedAppContext.test.tsx
describe("ImprovedAppContext", () => {
  it("should handle navigation changes", async () => {
    // 테스트 코드
  });

  it("should handle form state changes", async () => {
    // 테스트 코드
  });
});
```

### 2. 통합 테스트

```tsx
// 전체 플로우 테스트
it("should handle complete enrollment flow", async () => {
  // 1. 수강신청 시작
  // 2. 학원 선택
  // 3. 클래스 선택
  // 4. 뒤로가기 테스트
});
```

## 롤백 계획

만약 문제가 발생할 경우 기존 AppContext로 롤백할 수 있습니다:

```tsx
// 기존 AppContext 사용
import { AppProvider } from "@/contexts/AppContext";

<AppProvider>{children}</AppProvider>;
```

## 모니터링

### 1. 성능 모니터링

React DevTools를 사용하여 불필요한 리렌더링을 모니터링합니다.

### 2. 상태 동기화 모니터링

StateSync의 상태 변경을 로깅하여 동기화 문제를 추적합니다.

```tsx
// 개발 환경에서만 활성화
if (process.env.NODE_ENV === "development") {
  stateSync.subscribe("forms", (state) => {
    console.log("Forms state changed:", state);
  });
}
```

## 결론

새로운 아키텍처는 기존 코드와의 호환성을 유지하면서도 Context 간 상태 동기화 문제를 근본적으로 해결합니다. 점진적 마이그레이션을 통해 안전하게 전환할 수 있습니다.
