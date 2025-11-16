# 아키텍처 재설계: 뒤로가기 및 Virtual History 관리

## 설계 원칙

### 1. Single Source of Truth (SSOT)

- **Virtual History**: `GoBackManager`에서만 관리 (유일한 소유자)
- **뒤로가기 로직**: `GoBackManager`에서만 처리
- **상태 조작**: 각 Context는 자신의 상태만 관리

### 2. Separation of Concerns (SoC)

- **BackButtonHandler**: 뒤로가기 이벤트 수집 및 통합 (브라우저/Capacitor)
- **GoBackManager**: 뒤로가기 로직 처리 및 Virtual History 관리
- **NavigationContext**: 네비게이션 상태 관리만 담당
- **VirtualHistoryManager**: 데이터 구조만 관리 (비즈니스 로직 없음)

### 3. Chain of Responsibility

- 뒤로가기 요청을 체인으로 처리
- 각 핸들러가 처리할 수 없으면 다음 핸들러로 전달

## 새로운 아키텍처 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    BackButtonHandler                         │
│  (단일 진입점: 브라우저/Capacitor 모두 이곳으로)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    GoBackManager                             │
│  - Virtual History 소유 및 관리 (SSOT)                       │
│  - 뒤로가기 로직 처리 (Chain of Responsibility)              │
│  - 상태 변경은 StateSync를 통해서만                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Virtual      │ │ StateSync    │ │ EventBus     │
│ History      │ │ (상태 전파)   │ │ (이벤트)     │
│ Manager      │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 주요 변경사항

### 1. BackButtonHandler (새로 추가)

**책임**: 모든 뒤로가기 이벤트를 단일 핸들러로 통합

```typescript
// contexts/navigation/BackButtonHandler.ts
export class BackButtonHandler {
  private goBackManager: GoBackManager;
  private isHandling: boolean = false;

  constructor(goBackManager: GoBackManager) {
    this.goBackManager = goBackManager;
  }

  // 브라우저와 Capacitor 모두 이 메서드 호출
  async handleBackButton(canGoBack?: boolean): Promise<boolean> {
    if (this.isHandling) return false;

    this.isHandling = true;
    try {
      const result = await this.goBackManager.executeGoBack();
      return result.success;
    } finally {
      this.isHandling = false;
    }
  }
}
```

### 2. GoBackManager 개선

**책임**:

- Virtual History의 유일한 소유자 (SSOT)
- 뒤로가기 로직 처리 (Chain of Responsibility)
- 상태 변경은 StateSync를 통해서만

**주요 변경**:

- Virtual History 조작을 외부에 노출하지 않음
- `closeSubPage()` 같은 메서드 제공 (내부에서 Virtual History 관리)
- 컨테이너 첫 단계 처리 개선

```typescript
// contexts/navigation/GoBackManager.ts (개선안)

export class GoBackManager {
  // Virtual History는 여기서만 관리 (SSOT)
  private virtualHistory: VirtualHistoryManager;

  // Chain of Responsibility 패턴 적용
  private async handleGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    // Chain 1: Virtual History 확인 (form-step 우선)
    if (this.virtualHistory.canGoBack()) {
      const previousEntry = this.virtualHistory.getPreviousEntry();
      if (previousEntry?.type === "form-step") {
        return await this.handleFormStepBack(previousEntry, formsState);
      }
    }

    // Chain 2: 현재 컨테이너의 첫 단계인지 확인
    if (this.isFirstStepOfCurrentContainer(context, formsState)) {
      // Virtual History에 subpage 엔트리가 있으면 해당 서브페이지로
      if (this.hasSubPageEntryInHistory()) {
        return await this.handleSubPageHistoryBack();
      }
      // 없으면 현재 서브페이지 닫기
      return await this.closeCurrentSubPage();
    }

    // Chain 3: Virtual History의 subpage 엔트리 확인
    if (this.virtualHistory.canGoBack()) {
      const previousEntry = this.virtualHistory.getPreviousEntry();
      if (previousEntry?.type === "subpage") {
        return await this.handleSubPageBack(previousEntry);
      }
    }

    // Chain 4: 현재 서브페이지 닫기
    if (context.subPage) {
      return await this.closeCurrentSubPage();
    }

    // Chain 5: 더 이상 뒤로갈 수 없음
    return {
      success: false,
      action: "none",
      message: "더 이상 뒤로갈 수 없습니다.",
    };
  }

  // 공개 API: 서브페이지 닫기 (Virtual History 관리 포함)
  async closeSubPage(subPage: string | null): Promise<GoBackResult> {
    if (!subPage) {
      return { success: false, action: "none", message: "No subpage to close" };
    }

    // Virtual History에서 현재 subpage 엔트리 제거
    const currentEntry = this.virtualHistory.getCurrentEntry();
    if (
      currentEntry?.type === "subpage" &&
      currentEntry.data.subPage === subPage
    ) {
      this.virtualHistory.goBack();
    }

    // 상태 변경은 StateSync를 통해서만
    const navigationState = this.stateSync.getState("navigation");
    if (navigationState) {
      this.stateSync.publish("navigation", {
        ...navigationState,
        subPage: null,
        canGoBack: this.virtualHistory.canGoBack(),
      });
    }

    return {
      success: true,
      action: "close",
      data: { subPage: null },
    };
  }

  // 공개 API: Virtual History에 subpage 추가 (NavigationContext에서 호출)
  pushSubPage(subPage: string, activeTab: number): void {
    this.virtualHistory.push({
      type: "subpage",
      data: {
        subPage,
        activeTab,
        title: `Subpage: ${subPage}`,
        description: `Opened subpage ${subPage}`,
      },
    });
  }

  // 공개 API: Virtual History에 form-step 추가 (자동으로 호출됨)
  pushFormStep(formType: string, formStep: string): void {
    // 중복 방지
    const currentEntry = this.virtualHistory.getCurrentEntry();
    if (
      currentEntry?.type === "form-step" &&
      currentEntry.data.formType === formType &&
      currentEntry.data.formStep === formStep
    ) {
      return;
    }

    this.virtualHistory.push({
      type: "form-step",
      data: {
        formType,
        formStep,
        title: `${formType} - ${formStep}`,
        description: `Form step changed to ${formStep}`,
      },
    });
  }

  // 공개 API: Virtual History 초기화 (탭 변경 시에만 사용)
  clearHistory(): void {
    this.virtualHistory.clear();
  }

  // 내부 헬퍼 메서드들
  private isFirstStepOfCurrentContainer(
    context: GoBackContext,
    formsState: FormsState
  ): boolean {
    // 현재 서브페이지가 있고, 해당 컨테이너의 첫 단계인지 확인
    if (!context.subPage) return false;

    // enrollment 컨테이너
    if (context.subPage === "enroll") {
      return formsState.enrollment.currentStep === "academy-selection";
    }

    // 다른 컨테이너들도 동일한 패턴으로 확인
    // ...

    return false;
  }

  private hasSubPageEntryInHistory(): boolean {
    const state = this.virtualHistory.getState();
    return state.entries.some(
      (entry, index) => index < state.currentIndex && entry.type === "subpage"
    );
  }

  private async closeCurrentSubPage(): Promise<GoBackResult> {
    const navigationState = this.stateSync.getState("navigation");
    if (!navigationState?.subPage) {
      return {
        success: false,
        action: "none",
        message: "No subpage to close",
      };
    }

    return await this.closeSubPage(navigationState.subPage);
  }
}
```

### 3. NavigationContext 개선

**책임**: 네비게이션 상태 관리만 담당 (Virtual History 조작 제거)

```typescript
// contexts/navigation/NavigationContext.tsx (개선안)

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  formsState,
}) => {
  const [goBackManager] = useState(
    () => new GoBackManager(virtualHistory, contextEventBus, stateSync)
  );

  // Virtual History 조작은 GoBackManager에 위임
  const navigateToSubPage = useCallback(
    (page: string) => {
      if (!canAccessSubPage(page)) return;

      setSubPageState(page);

      // GoBackManager를 통해 Virtual History에 추가
      goBackManager.pushSubPage(page, activeTab);

      // 상태 발행
      stateSync.publish("navigation", {
        activeTab,
        subPage: page,
        canGoBack: true, // GoBackManager에서 계산
        // ...
      });
    },
    [goBackManager, activeTab, canAccessSubPage, stateSync]
  );

  // 서브페이지 닫기: GoBackManager에 위임
  const clearSubPage = useCallback(async () => {
    const result = await goBackManager.closeSubPage(subPage);
    if (result.success) {
      setSubPageState(null);
      // 상태 발행은 GoBackManager에서 처리
    }
  }, [goBackManager, subPage]);

  // 탭 변경: Virtual History 초기화는 GoBackManager에 위임
  const setActiveTab = useCallback(
    (tab: number) => {
      setActiveTabState(tab);
      setSubPageState(null);

      // GoBackManager를 통해 Virtual History 초기화
      goBackManager.clearHistory();

      // 상태 발행
      stateSync.publish("navigation", {
        activeTab: tab,
        subPage: null,
        canGoBack: false,
        // ...
      });
    },
    [goBackManager, stateSync]
  );
};
```

### 4. AppContext 개선

**책임**: BackButtonHandler를 통한 단일 진입점 제공

```typescript
// contexts/AppContext.tsx (개선안)

const AppConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const forms = useForms();
  const stateSync = useStateSync();

  // BackButtonHandler 인스턴스 생성
  const [backButtonHandler] = useState(() => {
    const goBackManager = navigation.getGoBackManager(); // NavigationContext에서 제공
    return new BackButtonHandler(goBackManager);
  });

  // 브라우저 뒤로가기 처리
  useEffect(() => {
    const handleBrowserBackButton = async (event: PopStateEvent) => {
      // preventDefault 제거 (효과 없음)
      const success = await backButtonHandler.handleBackButton();

      if (!success) {
        // 히스토리 상태 동기화 (pushState 대신 replaceState)
        window.history.replaceState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handleBrowserBackButton);
    return () =>
      window.removeEventListener("popstate", handleBrowserBackButton);
  }, [backButtonHandler]);

  // Capacitor 뒤로가기 처리
  useEffect(() => {
    if (typeof window === "undefined" || !("App" in window)) return;

    const handleNativeBackButton = async ({
      canGoBack,
    }: {
      canGoBack: boolean;
    }) => {
      const success = await backButtonHandler.handleBackButton(canGoBack);

      if (!success && !canGoBack) {
        const { App } = await import("@capacitor/app");
        App.exitApp();
      }
    };

    const { App } = window as { App: { addListener: Function } };
    App.addListener("backButton", handleNativeBackButton);

    return () => {
      App.removeListener("backButton", handleNativeBackButton);
    };
  }, [backButtonHandler]);
};
```

### 5. 컨테이너 완료 처리 개선

**책임**: 완료 시 Virtual History에서 현재 서브페이지만 제거

```typescript
// components/dashboard/student/Enrollment/enroll/EnrollmentCompleteStep.tsx (개선안)

export function EnrollmentCompleteStep() {
  const { navigation, resetEnrollment } = useApp();
  const { clearSubPage } = navigation; // GoBackManager.closeSubPage 호출

  const handleConfirm = async () => {
    // 데이터 정리
    // ...

    // 수강신청 상태 초기화
    resetEnrollment();

    // clearHistory() 제거 - clearSubPage가 Virtual History 관리
    // clearHistory(); // ❌ 제거

    // 서브페이지 닫기 (Virtual History에서 현재 subpage만 pop)
    await clearSubPage(); // ✅ GoBackManager가 처리
  };
}
```

## 변경사항 요약

### 제거/이동

1. ❌ `NavigationContext`에서 Virtual History 직접 조작 제거
2. ❌ `clearSubPage()`에서 Virtual History 직접 조작 제거
3. ❌ 컨테이너 완료 시 `clearHistory()` 호출 제거
4. ❌ `AppContext`와 `NavigationContext`의 중복된 뒤로가기 리스너 제거

### 추가/개선

1. ✅ `BackButtonHandler`: 단일 진입점 제공
2. ✅ `GoBackManager`: Virtual History의 유일한 소유자 (SSOT)
3. ✅ `GoBackManager.closeSubPage()`: 서브페이지 닫기 로직 통합
4. ✅ `GoBackManager.pushSubPage()`: 서브페이지 추가 로직 통합
5. ✅ Chain of Responsibility 패턴 적용
6. ✅ 컨테이너 첫 단계 처리 개선

## 마이그레이션 체크리스트

### Phase 1: 핵심 구조 변경

- [ ] `BackButtonHandler` 클래스 생성
- [ ] `GoBackManager`에 Virtual History 관리 메서드 추가
- [ ] `NavigationContext`에서 Virtual History 직접 조작 제거
- [ ] `AppContext`에서 단일 핸들러 사용

### Phase 2: 서브페이지 관리 개선

- [ ] `navigateToSubPage`에서 `goBackManager.pushSubPage()` 사용
- [ ] `clearSubPage`에서 `goBackManager.closeSubPage()` 사용
- [ ] `setActiveTab`에서 `goBackManager.clearHistory()` 사용

### Phase 3: 컨테이너 완료 처리

- [ ] 모든 완료 단계에서 `clearHistory()` 제거
- [ ] `clearSubPage()`만 호출하도록 변경

### Phase 4: 테스트 및 검증

- [ ] 뒤로가기 버튼 테스트
- [ ] 서브페이지 닫기 3가지 경로 테스트
- [ ] 컨테이너 단계별 뒤로가기 테스트
- [ ] Virtual History 상태 일관성 테스트

## 예상 효과

1. **일관성**: 모든 뒤로가기가 동일한 로직 사용
2. **안정성**: Virtual History 관리 중앙화로 상태 불일치 방지
3. **유지보수성**: 책임 분리로 코드 이해 및 수정 용이
4. **테스트 용이성**: 각 컴포넌트의 책임이 명확해 테스트 작성 용이
