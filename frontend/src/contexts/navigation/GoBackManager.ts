// src/contexts/navigation/GoBackManager.ts
import { VirtualHistoryManager } from "./VirtualHistoryManager";
import { ContextEventBus } from "../events/ContextEventBus";
import { GoBackContext, GoBackResult } from "../types/NavigationTypes";

export class GoBackManager {
  private virtualHistory: VirtualHistoryManager;
  private eventBus: ContextEventBus;

  constructor(
    virtualHistory: VirtualHistoryManager,
    eventBus: ContextEventBus
  ) {
    this.virtualHistory = virtualHistory;
    this.eventBus = eventBus;
  }

  // 공개 API
  async executeGoBack(context: GoBackContext): Promise<GoBackResult> {
    try {
      // context가 유효한지 확인
      if (!context) {
        return {
          success: false,
          action: "none",
          message: "Invalid context provided",
        };
      }

      // 1. 가상 히스토리에서 뒤로가기 시도
      if (this.virtualHistory.canGoBack()) {
        return await this.handleVirtualHistoryGoBack();
      }

      // 2. subPage가 열려있는지 확인
      if (context.subPage) {
        return await this.handleSubPageGoBack(context);
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
    } catch (error) {
      console.error("GoBack execution error:", error);
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
    context: GoBackContext
  ): Promise<GoBackResult> {
    const { subPage } = context;

    // subPage별 특수 로직 처리
    switch (subPage) {
      case "enroll":
        return await this.handleEnrollmentGoBack(context);
      case "create-class":
        return await this.handleCreateClassGoBack(context);
      case "auth":
        return await this.handleAuthGoBack(context);
      case "person-management":
        return await this.handlePersonManagementGoBack(context);
      case "modify":
        return await this.handleModifyGoBack(context);
      default:
        // 기본 subPage 닫기
        return {
          success: true,
          action: "close",
          data: { subPage: null },
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
    context: GoBackContext
  ): Promise<GoBackResult> {
    const enrollment = context.formStates.enrollment;
    if (!enrollment) {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
      };
    }

    const modificationStepOrder = ["date-selection", "payment"];
    const currentIndex = modificationStepOrder.indexOf(enrollment.currentStep);

    if (currentIndex > 0) {
      const previousStep = modificationStepOrder[currentIndex - 1];
      return {
        success: true,
        action: "step-back",
        data: { formType: "enrollment", step: previousStep },
      };
    }

    return {
      success: true,
      action: "close",
      data: { subPage: null },
    };
  }

  private async handleEnrollmentGoBack(
    context: GoBackContext
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

      return {
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
    context: GoBackContext
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
    context: GoBackContext
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
    context: GoBackContext
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

      this.virtualHistory.push({
        type: "form-step",
        data: {
          formType:
            personManagement === context.formStates.principalPersonManagement
              ? "principalPersonManagement"
              : "personManagement",
          formStep: previousStep,
          title: `Person Management - ${previousStep}`,
          description: `Moved to ${previousStep} step`,
        },
      });

      return {
        success: true,
        action: "step-back",
        data: {
          formType:
            personManagement === context.formStates.principalPersonManagement
              ? "principalPersonManagement"
              : "personManagement",
          step: previousStep,
          // 단계별 상태 초기화
          ...(previousStep === "session-list"
            ? { clearRequestSelection: true }
            : {}),
          ...(previousStep === "class-list"
            ? { clearSessionSelection: true }
            : {}),
        },
        message: `Person Management: ${personManagement.currentStep} → ${previousStep}`,
      };
    } else {
      return {
        success: true,
        action: "close",
        data: { subPage: null },
        message: "Person Management first step - closing subpage",
      };
    }
  }
}
