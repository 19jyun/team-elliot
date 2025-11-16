# 구현 가이드: 아키텍처 재설계

## 단계별 구현 순서

### Step 1: BackButtonHandler 생성

**파일**: `frontend/src/contexts/navigation/BackButtonHandler.ts`

```typescript
// contexts/navigation/BackButtonHandler.ts
import { GoBackManager } from "./GoBackManager";

/**
 * 뒤로가기 버튼 이벤트를 통합 처리하는 핸들러
 * 브라우저와 Capacitor 모두 이 핸들러를 통해 처리
 */
export class BackButtonHandler {
  private goBackManager: GoBackManager;
  private isHandling: boolean = false;

  constructor(goBackManager: GoBackManager) {
    this.goBackManager = goBackManager;
  }

  /**
   * 모든 뒤로가기 이벤트의 단일 진입점
   * @param canGoBack Capacitor에서 제공하는 히스토리 상태 (옵션)
   * @returns 뒤로가기 성공 여부
   */
  async handleBackButton(canGoBack?: boolean): Promise<boolean> {
    // 중복 실행 방지
    if (this.isHandling) {
      console.warn("BackButtonHandler: Already handling back button");
      return false;
    }

    this.isHandling = true;
    try {
      const result = await this.goBackManager.executeGoBack();

      // 실패 시 처리
      if (!result.success && canGoBack === false) {
        // 더 이상 뒤로갈 수 없음 (앱 종료 등)
        console.log("BackButtonHandler: Cannot go back further");
      }

      return result.success;
    } catch (error) {
      console.error("BackButtonHandler: Error handling back button", error);
      return false;
    } finally {
      this.isHandling = false;
    }
  }
}
```

### Step 2: GoBackManager 확장

**파일**: `frontend/src/contexts/navigation/GoBackManager.ts` (기존 파일 수정)

```typescript
// 기존 GoBackManager에 추가할 메서드들

export class GoBackManager {
  // ... 기존 코드 ...

  /**
   * 서브페이지를 Virtual History에 추가
   * NavigationContext에서 호출
   */
  pushSubPage(subPage: string, activeTab: number): void {
    // 중복 방지: 현재 엔트리가 같은 subpage이면 스킵
    const currentEntry = this.virtualHistory.getCurrentEntry();
    if (
      currentEntry?.type === "subpage" &&
      currentEntry.data.subPage === subPage
    ) {
      return;
    }

    this.virtualHistory.push({
      type: "subpage",
      data: {
        subPage,
        activeTab,
        title: `Subpage: ${subPage}`,
        description: `Opened subpage ${subPage}`,
      },
    });

    // 상태 업데이트
    this.updateCanGoBackState();
  }

  /**
   * 서브페이지 닫기 (Virtual History에서 제거)
   * NavigationContext와 컨테이너 완료 시 호출
   */
  async closeSubPage(subPage: string | null): Promise<GoBackResult> {
    if (!subPage) {
      return {
        success: false,
        action: "none",
        message: "No subpage to close",
      };
    }

    // Virtual History에서 현재 subpage 엔트리 제거
    const currentEntry = this.virtualHistory.getCurrentEntry();
    if (
      currentEntry?.type === "subpage" &&
      currentEntry.data.subPage === subPage
    ) {
      this.virtualHistory.goBack();
    }

    // 상태 업데이트
    const navigationState = this.stateSync.getState("navigation");
    if (navigationState) {
      this.stateSync.publish("navigation", {
        ...navigationState,
        subPage: null,
        canGoBack: this.virtualHistory.canGoBack(),
      });
    }

    // 이벤트 발생
    this.eventBus.emit("subPageClosed", { subPage });

    return {
      success: true,
      action: "close",
      data: { subPage: null },
      message: `Closed subpage: ${subPage}`,
    };
  }

  /**
   * Virtual History 초기화 (탭 변경 시에만 사용)
   */
  clearHistory(): void {
    this.virtualHistory.clear();
    this.updateCanGoBackState();
  }

  /**
   * 폼 단계를 Virtual History에 추가
   * FormsContext의 이벤트 리스너에서 호출
   */
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

    this.updateCanGoBackState();
  }

  /**
   * 뒤로가기 로직 개선 (Chain of Responsibility)
   */
  private async handleGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    // Chain 1: Virtual History의 form-step 확인 (우선순위 높음)
    if (this.virtualHistory.canGoBack()) {
      const previousEntry = this.virtualHistory.getPreviousEntry();
      if (previousEntry?.type === "form-step") {
        return await this.handleVirtualHistoryBack(previousEntry, formsState);
      }
    }

    // Chain 2: 현재 컨테이너의 첫 단계인지 확인
    if (this.isFirstStepOfCurrentContainer(context, formsState)) {
      // Virtual History에 이전 subpage 엔트리가 있는지 확인
      const previousSubPageEntry = this.findPreviousSubPageEntry();
      if (previousSubPageEntry) {
        // 이전 서브페이지로 이동
        return await this.handleSubPageBack(previousSubPageEntry);
      }
      // 없으면 현재 서브페이지 닫기
      return await this.closeCurrentSubPage(context);
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
      return await this.closeCurrentSubPage(context);
    }

    // Chain 5: 더 이상 뒤로갈 수 없음
    return {
      success: false,
      action: "none",
      message: "더 이상 뒤로갈 수 없습니다.",
    };
  }

  /**
   * 현재 컨테이너의 첫 단계인지 확인
   */
  private isFirstStepOfCurrentContainer(
    context: GoBackContext,
    formsState: FormsState
  ): boolean {
    if (!context.subPage) return false;

    // enrollment 컨테이너
    if (context.subPage === "enroll") {
      return formsState.enrollment.currentStep === "academy-selection";
    }

    // enrollmentModification 컨테이너 (modify-* 패턴)
    if (context.subPage.startsWith("modify-")) {
      // 첫 단계 확인 로직 (실제 첫 단계에 맞게 수정 필요)
      return (
        formsState.enrollmentModification.currentStep === "class-selection"
      );
    }

    // createClass 컨테이너
    if (context.subPage === "create-class") {
      return formsState.createClass.currentStep === "basic-info";
    }

    // principalCreateClass 컨테이너
    if (context.subPage === "principal-create-class") {
      return formsState.principalCreateClass.currentStep === "basic-info";
    }

    // personManagement 컨테이너
    if (context.subPage === "person-management") {
      return formsState.personManagement.currentStep === "class-list";
    }

    // principalPersonManagement 컨테이너
    if (context.subPage === "principal-person-management") {
      return formsState.principalPersonManagement.currentStep === "class-list";
    }

    return false;
  }

  /**
   * Virtual History에서 이전 subpage 엔트리 찾기
   */
  private findPreviousSubPageEntry(): HistoryEntry | null {
    const state = this.virtualHistory.getState();

    // 현재 인덱스 이전의 엔트리들 중 subpage 타입 찾기
    for (let i = state.currentIndex - 1; i >= 0; i--) {
      const entry = state.entries[i];
      if (entry.type === "subpage") {
        return entry;
      }
    }

    return null;
  }

  /**
   * 현재 서브페이지 닫기
   */
  private async closeCurrentSubPage(
    context: GoBackContext
  ): Promise<GoBackResult> {
    if (!context.subPage) {
      return {
        success: false,
        action: "none",
        message: "No subpage to close",
      };
    }

    return await this.closeSubPage(context.subPage);
  }

  /**
   * canGoBack 상태 업데이트
   */
  private updateCanGoBackState(): void {
    const navigationState = this.stateSync.getState("navigation");
    if (navigationState) {
      this.stateSync.publish("navigation", {
        ...navigationState,
        canGoBack: this.virtualHistory.canGoBack(),
      });
    }
  }

  /**
   * GoBackManager 인스턴스 반환 (BackButtonHandler에서 사용)
   */
  getInstance(): GoBackManager {
    return this;
  }
}
```

### Step 3: NavigationContext 수정

**파일**: `frontend/src/contexts/navigation/NavigationContext.tsx` (기존 파일 수정)

```typescript
// 주요 변경사항만 표시

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  formsState,
}) => {
  // ... 기존 코드 ...

  const [virtualHistory] = useState(() => new VirtualHistoryManager());
  const [goBackManager] = useState(
    () => new GoBackManager(virtualHistory, contextEventBus, stateSync)
  );

  // GoBackManager 인스턴스를 외부에 제공 (BackButtonHandler에서 사용)
  const getGoBackManager = useCallback(() => goBackManager, [goBackManager]);

  // navigateToSubPage 수정
  const navigateToSubPage = useCallback(
    (page: string) => {
      if (!canAccessSubPage(page)) {
        console.warn(
          `User with role ${userRole} cannot access subpage ${page}`
        );
        return;
      }

      setSubPageState(page);

      // GoBackManager를 통해 Virtual History에 추가
      goBackManager.pushSubPage(page, activeTab);

      // StateSync에 상태 발행
      const navigationState: NavigationState = {
        activeTab,
        subPage: page,
        canGoBack: virtualHistory.canGoBack(), // GoBackManager에서 계산된 값
        isTransitioning: false,
        navigationItems: getNavigationItems(),
        history: history,
      };
      stateSync.publish("navigation", navigationState);

      // 이벤트 발생
      contextEventBus.emit("navigationChanged", {
        subPage: page,
        activeTab,
      });
    },
    [
      activeTab,
      canAccessSubPage,
      userRole,
      goBackManager,
      virtualHistory,
      getNavigationItems,
      history,
      stateSync,
    ]
  );

  // clearSubPage 수정
  const clearSubPage = useCallback(async () => {
    // GoBackManager에 위임 (Virtual History 관리 포함)
    const result = await goBackManager.closeSubPage(subPage);

    if (result.success) {
      setSubPageState(null);

      // StateSync에 상태 발행 (GoBackManager에서도 하지만, 여기서도 명시적으로)
      const navigationState: NavigationState = {
        activeTab,
        subPage: null,
        canGoBack: virtualHistory.canGoBack(),
        isTransitioning: false,
        navigationItems: getNavigationItems(),
        history: history,
      };
      stateSync.publish("navigation", navigationState);

      // 이벤트 발생
      contextEventBus.emit("navigationChanged", {
        subPage: null,
        activeTab,
      });
    }
  }, [
    activeTab,
    goBackManager,
    subPage,
    virtualHistory,
    getNavigationItems,
    history,
    stateSync,
  ]);

  // setActiveTab 수정
  const setActiveTab = useCallback(
    (tab: number) => {
      setActiveTabState(tab);
      setSubPageState(null);

      // GoBackManager를 통해 Virtual History 초기화
      goBackManager.clearHistory();

      // 📢 중요: 탭 변경 이벤트 발행 (FormsContext에서 구독하여 폼 상태 초기화)
      contextEventBus.emit("tabChanged", { activeTab: tab });

      // StateSync에 상태 발행
      const navigationState: NavigationState = {
        activeTab: tab,
        subPage: null,
        canGoBack: false, // 히스토리를 비웠으므로 false
        isTransitioning: false,
        navigationItems: getNavigationItems(),
        history: [], // 히스토리를 비웠으므로 빈 배열
      };
      stateSync.publish("navigation", navigationState);

      // 이벤트 발생
      contextEventBus.emit("navigationChanged", {
        subPage: null,
        activeTab: tab,
      });
    },
    [getNavigationItems, stateSync, goBackManager]
  );

  // Virtual History 직접 조작 제거
  // ❌ 제거: virtualHistory.push() 직접 호출
  // ❌ 제거: virtualHistory.goBack() 직접 호출
  // ❌ 제거: virtualHistory.clear() 직접 호출 (setActiveTab 제외)

  // 폼 상태 변경 이벤트 구독 수정
  useEffect(() => {
    const unsubscribe = contextEventBus.subscribe(
      "formStateChanged",
      (data) => {
        // GoBackManager를 통해 Virtual History에 추가
        goBackManager.pushFormStep(data.formType, data.step);
      }
    );

    return unsubscribe;
  }, [goBackManager]);

  // Context value에 getGoBackManager 추가
  const value: NavigationContextType = {
    // ... 기존 값들 ...
    getGoBackManager, // 추가
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
```

### Step 4: AppContext 수정

**파일**: `frontend/src/contexts/AppContext.tsx` (기존 파일 수정)

```typescript
// 주요 변경사항만 표시

const AppConsumer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const forms = useForms();
  // ... 기존 코드 ...

  // BackButtonHandler 인스턴스 생성
  const [backButtonHandler] = useState(() => {
    const goBackManager = navigation.getGoBackManager();
    return new BackButtonHandler(goBackManager);
  });

  // 브라우저 뒤로가기 처리 (개선)
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

    // 초기 pushState 제거 또는 조건부 실행
    // ❌ 제거: window.history.pushState(null, '', window.location.href);

    // 대신 초기 상태만 설정 (한 번만)
    if (!window.history.state) {
      window.history.replaceState(
        { initialized: true },
        "",
        window.location.href
      );
    }

    return () => {
      window.removeEventListener("popstate", handleBrowserBackButton);
    };
  }, [backButtonHandler]);

  // Capacitor 뒤로가기 처리 (개선)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeCapacitorBackButton = async () => {
      try {
        const { App } = await import("@capacitor/app");
        const { Capacitor } = await import("@capacitor/core");

        if (!Capacitor.isNativePlatform()) {
          return; // 웹 환경에서는 등록하지 않음
        }

        const handleNativeBackButton = async ({
          canGoBack,
        }: {
          canGoBack: boolean;
        }) => {
          const success = await backButtonHandler.handleBackButton(canGoBack);

          if (!success && !canGoBack) {
            // 더 이상 뒤로갈 수 없으면 앱 종료
            App.exitApp();
          }
        };

        App.addListener("backButton", handleNativeBackButton);

        return () => {
          App.removeListener("backButton", handleNativeBackButton);
        };
      } catch (error) {
        console.warn("Capacitor App plugin not available", error);
      }
    };

    const cleanup = initializeCapacitorBackButton();

    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [backButtonHandler]);

  // 기존 unifiedGoBack 제거 (BackButtonHandler가 대체)
  // ❌ 제거: const unifiedGoBack = ...
  // ❌ 제거: const goBack = ...

  // 대신 navigation.goBack 사용 (내부적으로 GoBackManager 사용)
  const goBack = useCallback(async (): Promise<boolean> => {
    return await navigation.goBackWithForms(formsState);
  }, [navigation, formsState]);

  // ... 나머지 코드 ...
};
```

### Step 5: 컨테이너 완료 처리 수정

**파일**: 모든 완료 단계 컴포넌트 수정

```typescript
// components/dashboard/student/Enrollment/enroll/EnrollmentCompleteStep.tsx

export function EnrollmentCompleteStep() {
  const { navigation, resetEnrollment } = useApp();
  const { clearSubPage } = navigation;

  const handleConfirm = async () => {
    // localStorage 정리
    if (typeof window !== "undefined") {
      const { SyncStorage } = await import("@/lib/storage/StorageAdapter");
      // ... 정리 로직 ...
    }

    // 수강신청 상태 초기화
    resetEnrollment();

    // ❌ 제거: clearHistory();
    // Virtual History 관리는 clearSubPage에서 처리됨

    // 서브페이지 닫기 (Virtual History에서 현재 subpage만 pop)
    await clearSubPage(); // ✅ GoBackManager가 처리
  };

  // ... 나머지 코드 ...
}
```

## 마이그레이션 체크리스트

### Phase 1: 핵심 구조 (필수)

- [ ] `BackButtonHandler.ts` 생성
- [ ] `GoBackManager`에 새 메서드 추가
  - [ ] `pushSubPage()`
  - [ ] `closeSubPage()`
  - [ ] `clearHistory()`
  - [ ] `pushFormStep()`
  - [ ] `isFirstStepOfCurrentContainer()`
  - [ ] `findPreviousSubPageEntry()`
- [ ] `NavigationContext` 수정
  - [ ] `getGoBackManager()` 추가
  - [ ] `navigateToSubPage()` 수정
  - [ ] `clearSubPage()` 수정
  - [ ] `setActiveTab()` 수정
  - [ ] Virtual History 직접 조작 제거
- [ ] `AppContext` 수정
  - [ ] `BackButtonHandler` 사용
  - [ ] 브라우저/Capacitor 리스너 통합

### Phase 2: 컨테이너 완료 처리

- [ ] `EnrollmentCompleteStep` 수정
- [ ] `RefundCompleteStep` 수정
- [ ] `CreateClassComplete` 수정
- [ ] 기타 완료 단계 컴포넌트 수정

### Phase 3: 테스트

- [ ] 뒤로가기 버튼 테스트
- [ ] 서브페이지 닫기 3가지 경로 테스트
- [ ] 컨테이너 단계별 뒤로가기 테스트
- [ ] Virtual History 상태 일관성 테스트

## 주의사항

1. **점진적 마이그레이션**: 한 번에 모든 것을 변경하지 말고 단계적으로 진행
2. **테스트**: 각 단계마다 충분한 테스트 수행
3. **롤백 계획**: 문제 발생 시 빠르게 롤백할 수 있도록 준비
4. **로깅**: 디버깅을 위해 충분한 로그 추가

## 예상 문제 및 해결책

### 문제 1: 순환 참조

**증상**: `NavigationContext`와 `GoBackManager` 간 순환 참조

**해결책**:

- `GoBackManager`는 `NavigationContext`에 의존하지 않음
- `NavigationContext`가 `GoBackManager`를 소유하고 관리

### 문제 2: 상태 동기화 지연

**증상**: Virtual History와 실제 상태가 불일치

**해결책**:

- StateSync를 통한 상태 전파 보장
- `updateCanGoBackState()` 메서드로 상태 동기화

### 문제 3: 이벤트 리스너 중복

**증상**: 브라우저와 Capacitor 리스너가 동시에 실행

**해결책**:

- `BackButtonHandler`의 `isHandling` 플래그로 중복 방지
