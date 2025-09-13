// src/contexts/navigation/ImprovedGoBackManager.ts
import { VirtualHistoryManager } from "./VirtualHistoryManager";
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
      // StateSync에서 실제 상태를 가져옴
      const navigationState = this.stateSync.getState("navigation");
      const formsState = this.stateSync.getState("forms");

      // StateSync에서 상태를 가져올 수 없는 경우, 기본값으로 처리
      if (!navigationState || !formsState) {
        // 기본 뒤로가기 로직 (subPage가 있으면 닫기)
        if (navigationState?.subPage) {
          return {
            success: true,
            action: "close",
            data: { subPage: null },
            message: "Fallback: closing subpage",
          };
        }

        return {
          success: false,
          action: "none",
          message: "State not available and no fallback possible",
        };
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

      const result = await this.handleGoBack(context, formsState);

      return result;
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

      const result = await this.handleGoBack(context, formsState);

      return result;
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

  // 내부 구현 (캡슐화됨)
  private async handleGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    // 1. subPage가 열려있는지 확인 (우선순위)
    if (context.subPage) {
      return await this.handleSubPageGoBack(context, formsState);
    }

    // 2. 가상 히스토리에서 뒤로가기 시도
    if (this.virtualHistory.canGoBack()) {
      return await this.handleVirtualHistoryGoBack();
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

  private async handleVirtualHistoryGoBack(): Promise<GoBackResult> {
    const previousEntry = this.virtualHistory.getPreviousEntry();
    if (previousEntry) {
      this.virtualHistory.goBack();
      return {
        success: true,
        action: "history-back",
        data: { entry: previousEntry },
        message: `Reverted to: ${previousEntry.data.title || "Previous state"}`,
      };
    }
    return {
      success: false,
      action: "none",
      message: "No previous entry",
    };
  }

  private async handleSubPageGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    const { subPage } = context;

    // subPage별 특수 로직 처리
    switch (subPage) {
      case "enroll":
        return await this.handleEnrollmentGoBack(context, formsState);
      case "create-class":
        return await this.handleCreateClassGoBack(context, formsState);
      case "auth":
        return await this.handleAuthGoBack(context, formsState);
      case "person-management":
      case "enrollment-refund-management":
        return await this.handlePersonManagementGoBack(context, formsState);
      case "modify":
        return await this.handleModifyGoBack(context, formsState);
      case "academy":
      case "academy-management":
        // 학원 관리 subPage는 바로 닫기
        return {
          success: true,
          action: "close" as const,
          data: { subPage: null },
          message: "Academy management subpage closed",
        };
      default:
        // 기본 subPage 닫기
        return {
          success: true,
          action: "close" as const,
          data: { subPage: null },
          message: `Subpage ${subPage} closed`,
        };
    }
  }

  private async handleTabGoBack(context: GoBackContext): Promise<GoBackResult> {
    const { activeTab } = context;
    const previousTab = Math.max(0, activeTab - 1);

    return {
      success: true,
      action: "navigate",
      data: { activeTab: previousTab },
    };
  }

  private async handleModifyGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    const enrollment = context.formStates.enrollment;
    if (!enrollment) {
      return {
        success: true,
        action: "close" as const,
        data: { subPage: null },
      };
    }

    // 수정 폼의 단계 순서 (enrollment modification 실제 단계)
    const modificationStepOrder = [
      "date-selection",
      "payment",
      "refund-request",
      "refund-complete",
      "complete",
    ];
    const currentIndex = modificationStepOrder.indexOf(enrollment.currentStep);

    if (currentIndex > 0) {
      const previousStep = modificationStepOrder[currentIndex - 1];

      // 가상 히스토리에 현재 상태 저장
      this.virtualHistory.push({
        type: "form-step",
        data: {
          formType: "enrollment",
          formStep: previousStep,
          title: `Enrollment Modification - ${previousStep}`,
          description: `Moved to ${previousStep} step`,
        },
      });

      // 실제 폼 상태 업데이트
      this.stateSync.publish("forms", {
        ...formsState,
        enrollment: {
          ...formsState.enrollment,
          currentStep: previousStep as EnrollmentStep,
        },
      });

      return {
        success: true,
        action: "step-back" as const,
        data: { formType: "enrollment", step: previousStep },
        message: `Enrollment Modification: ${enrollment.currentStep} → ${previousStep}`,
      };
    }

    // 첫 번째 단계이거나 현재 단계가 수정 단계에 없는 경우 subPage 닫기
    return {
      success: true,
      action: "close" as const,
      data: { subPage: null },
      message: "Enrollment modification first step - closing subpage",
    };
  }

  private async handleEnrollmentGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    const enrollment = context.formStates.enrollment;

    if (!enrollment) {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
      };
    }

    const stepOrder = [
      "academy-selection",
      "class-selection",
      "date-selection",
      "payment",
      "complete",
    ];
    const currentIndex = stepOrder.indexOf(enrollment.currentStep);

    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];

      // 가상 히스토리에 현재 상태 저장
      this.virtualHistory.push({
        type: "form-step",
        data: {
          formType: "enrollment",
          formStep: previousStep,
          title: `Enrollment - ${previousStep}`,
          description: `Moved to ${previousStep} step`,
        },
      });

      // 실제 폼 상태 업데이트
      this.stateSync.publish("forms", {
        ...formsState,
        enrollment: {
          ...formsState.enrollment,
          currentStep: previousStep as EnrollmentStep,
        },
      });

      const result = {
        success: true,
        action: "step-back",
        data: {
          formType: "enrollment",
          step: previousStep,
          // class-selection에서 academy-selection으로 돌아갈 때 환불 동의 상태 초기화
          ...(enrollment.currentStep === "class-selection" &&
          previousStep === "academy-selection"
            ? { clearRefundPolicy: true }
            : {}),
        },
        message: `Enrollment: ${enrollment.currentStep} → ${previousStep}`,
      };
      return result as GoBackResult;
    } else {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
        message: "Enrollment first step - closing subpage",
      };
    }
  }

  private async handleCreateClassGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    const createClass = context.formStates.createClass;
    if (!createClass) {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
      };
    }

    const stepOrder = ["info", "teacher", "schedule", "content", "complete"];
    const currentIndex = stepOrder.indexOf(createClass.currentStep);

    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];

      this.virtualHistory.push({
        type: "form-step",
        data: {
          formType: "createClass",
          formStep: previousStep,
          title: `Create Class - ${previousStep}`,
          description: `Moved to ${previousStep} step`,
        },
      });

      // 실제 폼 상태 업데이트
      this.stateSync.publish("forms", {
        ...formsState,
        createClass: {
          ...formsState.createClass,
          currentStep: previousStep as CreateClassStep,
        },
      });

      return {
        success: true,
        action: "step-back",
        data: { formType: "createClass", step: previousStep },
        message: `Create Class: ${createClass.currentStep} → ${previousStep}`,
      };
    } else {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
        message: "Create Class first step - closing subpage",
      };
    }
  }

  private async handleAuthGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    const auth = context.formStates.auth;
    if (!auth) {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
      };
    }

    const stepOrder = [
      "role-selection",
      "personal-info",
      "account-info",
      "terms",
    ];
    const currentIndex = stepOrder.indexOf(auth.currentStep);

    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];

      this.virtualHistory.push({
        type: "form-step",
        data: {
          formType: "auth",
          formStep: previousStep,
          title: `Auth - ${previousStep}`,
          description: `Moved to ${previousStep} step`,
        },
      });

      // 실제 폼 상태 업데이트
      this.stateSync.publish("forms", {
        ...formsState,
        auth: {
          ...formsState.auth,
          signup: {
            ...formsState.auth.signup,
            step: previousStep as SignupStep,
          },
        },
      });

      return {
        success: true,
        action: "step-back",
        data: { formType: "auth", step: previousStep },
        message: `Auth: ${auth.currentStep} → ${previousStep}`,
      };
    } else {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
        message: "Auth first step - closing subpage",
      };
    }
  }

  private async handlePersonManagementGoBack(
    context: GoBackContext,
    formsState: FormsState
  ): Promise<GoBackResult> {
    const personManagement =
      context.formStates.principalPersonManagement ||
      context.formStates.personManagement;
    if (!personManagement) {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
      };
    }

    const stepOrder = ["class-list", "session-list", "request-detail"];
    const currentIndex = stepOrder.indexOf(personManagement.currentStep);

    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      const formType =
        personManagement === context.formStates.principalPersonManagement
          ? "principalPersonManagement"
          : "personManagement";

      this.virtualHistory.push({
        type: "form-step",
        data: {
          formType,
          formStep: previousStep,
          title: `Person Management - ${previousStep}`,
          description: `Moved to ${previousStep} step`,
        },
      });

      // 이전 단계로 돌아갈 때 관련 선택 상태 초기화
      const updatedFormState = {
        ...(formsState as any)[formType],
        currentStep: previousStep,
        // 단계별 초기화
        ...(previousStep === "class-list" && {
          selectedClassId: null,
          selectedSessionId: null,
          selectedRequestId: null,
          selectedRequestType: null,
        }),
        ...(previousStep === "session-list" && {
          selectedSessionId: null,
          selectedRequestId: null,
          selectedRequestType: null,
        }),
      };

      // 실제 폼 상태 업데이트
      this.stateSync.publish("forms", {
        ...formsState,
        [formType]: updatedFormState,
      });

      const result = {
        success: true,
        action: "step-back" as const,
        data: {
          formType,
          step: previousStep,
          // 단계별 초기화 플래그
          ...(previousStep === "class-list" && { clearAllSelections: true }),
          ...(previousStep === "session-list" && {
            clearSessionAndRequestSelections: true,
          }),
        },
        message: `Person Management: ${personManagement.currentStep} → ${previousStep}`,
      };

      return result;
    } else {
      return {
        success: true,
        action: "close" as const,
        data: { subPage: null },
        message: "Person Management first step - closing subpage",
      };
    }
  }
}
