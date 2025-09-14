// src/contexts/navigation/ImprovedGoBackManager.ts
import { VirtualHistoryManager, HistoryEntry } from "./VirtualHistoryManager";
import { ContextEventBus } from "../events/ContextEventBus";
import { GoBackContext, GoBackResult } from "../types/NavigationTypes";
import {
  StateSyncContextType,
  FormsState,
  NavigationState,
} from "../state/StateSyncTypes";
import { EnrollmentStep } from "../forms/EnrollmentFormManager";
import { SignupStep } from "../forms/AuthFormManager";
import { CreateClassStep } from "../forms/CreateClassFormManager";
import { PrincipalPersonManagementStep } from "../forms/PrincipalPersonManagementFormManager";

export class ImprovedGoBackManager {
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
        history: this.virtualHistory.getState().entries,
        currentHistoryIndex: this.virtualHistory.getState().currentIndex,
      };

      return await this.handleGoBack(context, formsState);
    } catch (error) {
      console.error("ImprovedGoBackManager execution error:", error);
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
        history: this.virtualHistory.getState().entries,
        currentHistoryIndex: this.virtualHistory.getState().currentIndex,
      };

      return await this.handleGoBack(context, formsState);
    } catch (error) {
      console.error("ImprovedGoBackManager execution error:", error);
      return {
        success: false,
        action: "none",
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  // 🔑 새로운 통합 뒤로가기 로직
  private async handleGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    // 1. Virtual History 우선 확인 (모든 경우에 적용)
    if (this.virtualHistory.canGoBack()) {
      const previousEntry = this.virtualHistory.getPreviousEntry();
      if (previousEntry) {
        return await this.handleVirtualHistoryBack(previousEntry, formsState);
      }
    }

    // 2. subPage가 열려있으면 subPage 닫기
    if (context.subPage) {
      return {
        success: true,
        action: "close" as const,
        data: { subPage: null },
        message: `Closing subpage: ${context.subPage}`,
      };
    }

    // 3. 탭 변경 가능한지 확인
    if (context.activeTab > 0) {
      return await this.handleTabGoBack(context);
    }

    // 4. 더 이상 뒤로갈 수 없음
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
      action: "close" as const,
      data: { subPage: null },
      message: `SubPage: ${subPage}`,
    };
  }

  // 🔑 탭 뒤로가기 처리
  private async handleTabGoBack(context: GoBackContext): Promise<GoBackResult> {
    const { activeTab } = context;
    const previousTab = Math.max(0, activeTab - 1);

    return {
      success: true,
      action: "navigate",
      data: { activeTab: previousTab },
      message: `Tab: ${activeTab} → ${previousTab}`,
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
}
