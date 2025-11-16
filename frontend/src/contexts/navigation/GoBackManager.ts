// src/contexts/navigation/GoBackManager.ts
import { VirtualHistoryManager, HistoryEntry } from "./VirtualHistoryManager";
import { ContextEventBus } from "../events/ContextEventBus";
import { GoBackContext, GoBackResult } from "../types/NavigationTypes";
import {
  StateSyncContextType,
  FormsState,
  NavigationState,
} from "../state/StateSyncTypes";
import { EnrollmentStep } from "../forms/EnrollmentFormManager";
import { EnrollmentModificationStep } from "../forms/EnrollmentModificationFormManager";
import { SignupStep } from "../forms/AuthFormManager";
import { CreateClassStep } from "../forms/CreateClassFormManager";
import { PrincipalPersonManagementStep } from "../forms/PrincipalPersonManagementFormManager";

export class GoBackManager {
  private virtualHistory: VirtualHistoryManager;
  private eventBus: ContextEventBus;
  private stateSync: StateSyncContextType;

  constructor(
    virtualHistory: VirtualHistoryManager,
    eventBus: ContextEventBus,
    stateSync: StateSyncContextType
  ) {
    this.virtualHistory = virtualHistory;
    this.eventBus = eventBus;
    this.stateSync = stateSync;
  }

  // 공개 API - StateSync를 사용하는 버전
  async executeGoBack(): Promise<GoBackResult> {
    try {
      const navigationState = this.stateSync.getState("navigation");
      const formsState = this.stateSync.getState("forms");

      if (!navigationState || !formsState) {
        return this.handleFallbackGoBack(navigationState);
      }

      const virtualHistoryState = this.virtualHistory.getState();

      const context: GoBackContext = {
        subPage: navigationState.subPage,
        activeTab: navigationState.activeTab,
        formStates: {
          enrollment: { currentStep: formsState.enrollment.currentStep },
          createClass: { currentStep: formsState.createClass.currentStep },
          auth: { currentStep: formsState.auth.signup.step },
          personManagement: {
            currentStep: formsState.personManagement.currentStep,
          },
          principalPersonManagement: {
            currentStep: formsState.principalPersonManagement.currentStep,
          },
        },
        history: virtualHistoryState.entries,
        currentHistoryIndex: virtualHistoryState.currentIndex,
      };

      return await this.handleGoBack(context, formsState);
    } catch (error) {
      console.error(`[GoBackManager] 실행 오류`, error);
      return {
        success: false,
        action: "none",
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  // 공개 API - 직접 상태를 받는 버전
  async executeGoBackWithState(
    navigationState: NavigationState,
    formsState: FormsState
  ): Promise<GoBackResult> {
    try {
      const virtualHistoryState = this.virtualHistory.getState();

      const context: GoBackContext = {
        subPage: navigationState.subPage,
        activeTab: navigationState.activeTab,
        formStates: {
          enrollment: { currentStep: formsState.enrollment.currentStep },
          createClass: { currentStep: formsState.createClass.currentStep },
          auth: { currentStep: formsState.auth.signup.step },
          personManagement: {
            currentStep: formsState.personManagement.currentStep,
          },
          principalPersonManagement: {
            currentStep: formsState.principalPersonManagement.currentStep,
          },
        },
        history: virtualHistoryState.entries,
        currentHistoryIndex: virtualHistoryState.currentIndex,
      };

      return await this.handleGoBack(context, formsState);
    } catch (error) {
      console.error(`[GoBackManager] 실행 오류`, error);
      return {
        success: false,
        action: "none",
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  // 🔑 새로운 통합 뒤로가기 로직 (Chain of Responsibility 패턴)
  private async handleGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    // Chain 1: Virtual History의 form-step 확인 (우선순위 높음)
    // 단, 현재 서브페이지가 열려 있으면 서브페이지를 먼저 닫아야 함
    // 컨테이너 내부의 단계별 뒤로가기는 가장 우선적으로 처리
    if (this.virtualHistory.canGoBack() && !context.subPage) {
      // 현재 서브페이지가 없을 때만 form-step 처리
      const previousEntry = this.virtualHistory.getPreviousEntry();

      if (previousEntry?.type === "form-step") {
        return await this.handleVirtualHistoryBack(previousEntry, formsState);
      }
    }

    // Chain 2: 현재 컨테이너의 첫 단계인지 확인
    // 첫 단계에서 뒤로가기를 누르면 서브페이지를 닫아야 함
    const isFirstStep = this.isFirstStepOfCurrentContainer(context, formsState);

    if (isFirstStep) {
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
    // 여러 서브페이지를 거쳐온 경우 이전 서브페이지로 이동
    if (this.virtualHistory.canGoBack()) {
      const previousEntry = this.virtualHistory.getPreviousEntry();

      if (previousEntry?.type === "subpage") {
        return await this.handleVirtualHistoryBack(previousEntry, formsState);
      }
    }

    // Chain 4: 현재 서브페이지 닫기
    // 위 모든 조건에 해당하지 않으면 현재 서브페이지만 닫기
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

  // 🔑 Virtual History 기반 뒤로가기 처리
  private async handleVirtualHistoryBack(
    previousEntry: HistoryEntry,
    formsState: FormsState
  ): Promise<GoBackResult> {
    // Virtual History 인덱스 이동
    this.virtualHistory.goBack();

    // 이전 엔트리 타입에 따른 처리
    switch (previousEntry.type) {
      case "form-step":
        return await this.handleFormStepBack(previousEntry, formsState);

      case "navigation":
        return await this.handleNavigationBack(previousEntry);

      case "subpage":
        return await this.handleSubPageBack(previousEntry);

      default:
        return {
          success: true,
          action: "history-back" as const,
          data: { entry: previousEntry },
          message: `Reverted to: ${previousEntry.data.title}`,
        };
    }
  }

  // 🔑 폼 단계 뒤로가기 처리
  private async handleFormStepBack(
    previousEntry: HistoryEntry,
    formsState: FormsState
  ): Promise<GoBackResult> {
    const { formType, formStep } = previousEntry.data;

    // 폼 타입별 상태 업데이트
    switch (formType) {
      case "enrollment":
        this.stateSync.publish("forms", {
          ...formsState,
          enrollment: {
            ...formsState.enrollment,
            currentStep: formStep as EnrollmentStep,
          },
        });
        break;

      case "createClass":
        this.stateSync.publish("forms", {
          ...formsState,
          createClass: {
            ...formsState.createClass,
            currentStep: formStep as CreateClassStep,
          },
        });
        break;

      case "auth":
        this.stateSync.publish("forms", {
          ...formsState,
          auth: {
            ...formsState.auth,
            signup: {
              ...formsState.auth.signup,
              step: formStep as SignupStep,
            },
          },
        });
        break;

      case "personManagement":
        this.stateSync.publish("forms", {
          ...formsState,
          personManagement: {
            ...formsState.personManagement,
            currentStep: formStep as PrincipalPersonManagementStep,
          },
        });
        break;

      case "principalPersonManagement":
        this.stateSync.publish("forms", {
          ...formsState,
          principalPersonManagement: {
            ...formsState.principalPersonManagement,
            currentStep: formStep as PrincipalPersonManagementStep,
          },
        });
        break;
    }

    return {
      success: true,
      action: "history-back" as const,
      data: {
        formType,
        step: formStep,
        entry: previousEntry,
      },
      message: `Virtual History: ${previousEntry.data.title}`,
    };
  }

  // 🔑 네비게이션 뒤로가기 처리
  private async handleNavigationBack(
    previousEntry: HistoryEntry
  ): Promise<GoBackResult> {
    const { activeTab } = previousEntry.data;

    return {
      success: true,
      action: "navigate" as const,
      data: { activeTab },
      message: `Navigation: Tab ${activeTab}`,
    };
  }

  // 🔑 서브페이지 뒤로가기 처리
  private async handleSubPageBack(
    previousEntry: HistoryEntry
  ): Promise<GoBackResult> {
    const { subPage } = previousEntry.data;

    return {
      success: true,
      action: "navigate" as const,
      data: { subPage },
      message: `Navigating to SubPage: ${subPage}`,
    };
  }

  // 🔑 Fallback 처리
  private async handleFallbackGoBack(
    navigationState: NavigationState | null
  ): Promise<GoBackResult> {
    if (navigationState?.subPage) {
      return {
        success: true,
        action: "close" as const,
        data: { subPage: null },
        message: `Fallback: Closing subpage ${navigationState.subPage}`,
      };
    }

    return {
      success: false,
      action: "none",
      message: "더 이상 뒤로갈 수 없습니다.",
    };
  }

  // ==========================================
  // 공개 API: Virtual History 관리 (SSOT)
  // ==========================================

  /**
   * 서브페이지를 Virtual History에 추가
   * NavigationContext의 navigateToSubPage에서 호출
   *
   * @param subPage 서브페이지 식별자
   * @param activeTab 현재 활성 탭 인덱스
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

    // canGoBack 상태 업데이트
    this.updateCanGoBackState();
  }

  /**
   * 서브페이지 닫기 (Virtual History에서 제거)
   * NavigationContext의 clearSubPage와 컨테이너 완료 시 호출
   *
   * @param subPage 닫을 서브페이지 식별자
   * @returns 뒤로가기 결과
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
    const virtualHistoryState = this.virtualHistory.getState();
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

    // NavigationContext가 상태를 업데이트하도록 이벤트 발생
    // 이벤트를 통해 NavigationContext의 setSubPageState(null) 호출
    this.eventBus.emit("subPageClosed", {
      subPage: null,
      activeTab: navigationState?.activeTab ?? 0,
    });

    // canGoBack 상태 업데이트
    this.updateCanGoBackState();

    return {
      success: true,
      action: "close",
      data: { subPage: null },
      message: `Closed subpage: ${subPage}`,
    };
  }

  /**
   * Virtual History 초기화 (탭 변경 시에만 사용)
   * NavigationContext의 setActiveTab에서 호출
   */
  clearHistory(): void {
    this.virtualHistory.clear();
    // canGoBack 상태 업데이트
    this.updateCanGoBackState();
  }

  /**
   * 폼 단계를 Virtual History에 추가
   * FormsContext의 이벤트 리스너에서 호출
   *
   * @param formType 폼 타입 (enrollment, createClass 등)
   * @param formStep 폼 단계
   */
  pushFormStep(formType: string, formStep: string): void {
    // 중복 방지: 현재 엔트리가 같은 form-step이면 스킵
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

    // canGoBack 상태 업데이트
    this.updateCanGoBackState();
  }

  /**
   * GoBackManager 인스턴스 반환 (BackButtonHandler에서 사용)
   */
  getInstance(): GoBackManager {
    return this;
  }

  // ==========================================
  // 내부 헬퍼 메서드들
  // ==========================================

  /**
   * 현재 컨테이너의 첫 단계인지 확인
   * 첫 단계에서 뒤로가기를 누르면 서브페이지를 닫아야 함
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
      return formsState.enrollmentModification.currentStep === "date-selection";
    }

    // createClass 컨테이너
    if (context.subPage === "create-class") {
      return formsState.createClass.currentStep === "info";
    }

    // principalCreateClass 컨테이너
    if (context.subPage === "principal-create-class") {
      return formsState.principalCreateClass.currentStep === "info";
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
   * 현재 인덱스 이전의 엔트리들 중 subpage 타입을 찾음
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
   * Virtual History 변경 시 StateSync에 상태 발행
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
}
