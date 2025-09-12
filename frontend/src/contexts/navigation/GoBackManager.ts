// src/contexts/navigation/GoBackManager.ts
import { VirtualHistoryManager } from "./VirtualHistoryManager";
import { ContextEventBus } from "../events/ContextEventBus";

export interface GoBackContext {
  subPage: string | null;
  activeTab: number;
  formStates: {
    enrollment?: { currentStep: string };
    createClass?: { currentStep: string };
    auth?: { currentStep: string };
    personManagement?: { currentStep: string };
  };
}

export interface GoBackResult {
  success: boolean;
  action: "subpage-closed" | "step-reverted" | "no-action";
  description: string;
}

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
      // 1. 가상 히스토리에서 뒤로가기 시도
      if (this.virtualHistory.canGoBack()) {
        return await this.handleVirtualHistoryGoBack();
      }

      // 2. subPage 내부 단계 뒤로가기 시도
      if (context.subPage) {
        return await this.handleSubPageInternalGoBack(context);
      }

      // 3. subPage 닫기
      return await this.handleSubPageClose(context);
    } catch (error) {
      console.error("GoBack execution error:", error);
      return {
        success: false,
        action: "no-action",
        description: `Error: ${
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
        action: "step-reverted",
        description: `Reverted to: ${
          previousEntry.data.title || "Previous state"
        }`,
      };
    }
    return {
      success: false,
      action: "no-action",
      description: "No previous entry",
    };
  }

  private async handleSubPageInternalGoBack(
    context: GoBackContext
  ): Promise<GoBackResult> {
    if (!context.subPage) {
      return { success: false, action: "no-action", description: "No subpage" };
    }

    switch (context.subPage) {
      case "enroll":
        return this.handleEnrollmentGoBack(context);
      case "create-class":
        return this.handleCreateClassGoBack(context);
      case "auth":
        return this.handleAuthGoBack(context);
      case "person-management":
        return this.handlePersonManagementGoBack(context);
      default:
        return {
          success: false,
          action: "no-action",
          description: "Unknown subpage",
        };
    }
  }

  private async handleEnrollmentGoBack(
    context: GoBackContext
  ): Promise<GoBackResult> {
    const enrollment = context.formStates.enrollment;
    if (!enrollment) {
      return {
        success: false,
        action: "no-action",
        description: "No enrollment state",
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
        action: "step-reverted",
        description: `Enrollment: ${enrollment.currentStep} → ${previousStep}`,
      };
    } else {
      return {
        success: true,
        action: "subpage-closed",
        description: "Enrollment first step - closing subpage",
      };
    }
  }

  private async handleCreateClassGoBack(
    context: GoBackContext
  ): Promise<GoBackResult> {
    const createClass = context.formStates.createClass;
    if (!createClass) {
      return {
        success: false,
        action: "no-action",
        description: "No createClass state",
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
        action: "step-reverted",
        description: `Create Class: ${createClass.currentStep} → ${previousStep}`,
      };
    } else {
      return {
        success: true,
        action: "subpage-closed",
        description: "Create Class first step - closing subpage",
      };
    }
  }

  private async handleAuthGoBack(
    context: GoBackContext
  ): Promise<GoBackResult> {
    const auth = context.formStates.auth;
    if (!auth) {
      return {
        success: false,
        action: "no-action",
        description: "No auth state",
      };
    }

    const stepOrder = [
      "signup-role",
      "signup-personal",
      "signup-account",
      "signup-terms",
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
        action: "step-reverted",
        description: `Auth: ${auth.currentStep} → ${previousStep}`,
      };
    } else {
      return {
        success: true,
        action: "subpage-closed",
        description: "Auth first step - closing subpage",
      };
    }
  }

  private async handlePersonManagementGoBack(
    context: GoBackContext
  ): Promise<GoBackResult> {
    const personManagement = context.formStates.personManagement;
    if (!personManagement) {
      return {
        success: false,
        action: "no-action",
        description: "No personManagement state",
      };
    }

    const stepOrder = ["class-list", "session-list", "request-detail"];
    const currentIndex = stepOrder.indexOf(personManagement.currentStep);

    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];

      this.virtualHistory.push({
        type: "form-step",
        data: {
          formType: "personManagement",
          formStep: previousStep,
          title: `Person Management - ${previousStep}`,
          description: `Moved to ${previousStep} step`,
        },
      });

      return {
        success: true,
        action: "step-reverted",
        description: `Person Management: ${personManagement.currentStep} → ${previousStep}`,
      };
    } else {
      return {
        success: true,
        action: "subpage-closed",
        description: "Person Management first step - closing subpage",
      };
    }
  }

  private async handleSubPageClose(
    context: GoBackContext
  ): Promise<GoBackResult> {
    if (context.subPage) {
      return {
        success: true,
        action: "subpage-closed",
        description: `Closed subpage: ${context.subPage}`,
      };
    }
    return {
      success: false,
      action: "no-action",
      description: "No subpage to close",
    };
  }
}
