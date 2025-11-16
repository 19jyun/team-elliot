// src/contexts/forms/EnrollmentModificationFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";
import { EnrollmentModificationData } from "./EnrollmentFormManager";

// 수강 변경 플로우 전용 Step 타입
export type EnrollmentModificationStep =
  | "date-selection"
  | "payment"
  | "refund-request"
  | "refund-complete"
  | "complete";

export interface EnrollmentModificationFormState {
  currentStep: EnrollmentModificationStep;
  modificationData: EnrollmentModificationData | null;
}

export class EnrollmentModificationFormManager {
  private state: EnrollmentModificationFormState;
  private eventBus: ContextEventBus;
  private listeners: Set<(state: EnrollmentModificationFormState) => void> =
    new Set();

  constructor(eventBus: ContextEventBus) {
    this.state = this.getInitialState();
    this.eventBus = eventBus;
  }

  // 공개 API
  getState(): EnrollmentModificationFormState {
    return { ...this.state };
  }

  setCurrentStep(step: EnrollmentModificationStep): void {
    if (this.canNavigateToStep(step)) {
      this.state.currentStep = step;
      this.emitStateChange();
      this.notifyListeners();
    }
  }

  setModificationData(data: EnrollmentModificationData | null): void {
    this.state.modificationData = data;
    this.emitStateChange();
    this.notifyListeners();
  }

  // 유효성 검사
  validateStep(step: EnrollmentModificationStep): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    switch (step) {
      case "date-selection":
        // date-selection은 항상 유효 (선택된 세션이 없어도 초기 단계이므로)
        break;
      case "payment":
        if (!this.state.modificationData) {
          errors.push("수강 변경 정보가 없습니다.");
        } else if (
          this.state.modificationData.changeType !== "additional_payment"
        ) {
          errors.push("추가 결제가 필요한 상태가 아닙니다.");
        }
        break;
      case "refund-request":
        if (!this.state.modificationData) {
          errors.push("수강 변경 정보가 없습니다.");
        } else if (this.state.modificationData.changeType !== "refund") {
          errors.push("환불 신청이 필요한 상태가 아닙니다.");
        }
        break;
      case "refund-complete":
      case "complete":
        // 완료 단계는 항상 유효
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateCurrentStep(): { isValid: boolean; errors: string[] } {
    return this.validateStep(this.state.currentStep);
  }

  canProceedToNextStep(): boolean {
    const validation = this.validateCurrentStep();
    return validation.isValid;
  }

  reset(): void {
    this.state = this.getInitialState();
    this.emitStateChange();
    this.notifyListeners();
  }

  // 구독/구독 해제
  subscribe(
    listener: (state: EnrollmentModificationFormState) => void
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 내부 구현 (캡슐화됨)
  private getInitialState(): EnrollmentModificationFormState {
    return {
      currentStep: "date-selection",
      modificationData: null,
    };
  }

  private canNavigateToStep(step: EnrollmentModificationStep): boolean {
    const stepOrder: EnrollmentModificationStep[] = [
      "date-selection",
      "payment",
      "refund-request",
      "refund-complete",
      "complete",
    ];

    const currentIndex = stepOrder.indexOf(this.state.currentStep);
    const newIndex = stepOrder.indexOf(step);

    // 수강 변경 플로우는 더 유연한 네비게이션 허용
    // date-selection에서 payment/refund-request로 직접 이동 가능
    // payment/refund-request에서 refund-complete로 이동 가능
    // refund-complete에서 complete로 이동 가능

    // 이전 단계로 돌아가는 것은 항상 허용
    if (newIndex < currentIndex) {
      return true;
    }

    // 다음 단계로 진행하는 경우
    if (newIndex === currentIndex + 1) {
      return true;
    }

    // date-selection에서 payment 또는 refund-request로 직접 이동 (modificationData가 있는 경우)
    if (
      this.state.currentStep === "date-selection" &&
      (step === "payment" || step === "refund-request") &&
      this.state.modificationData !== null
    ) {
      return true;
    }

    // payment/refund-request에서 refund-complete로 이동
    if (
      (this.state.currentStep === "payment" ||
        this.state.currentStep === "refund-request") &&
      step === "refund-complete"
    ) {
      return true;
    }

    // refund-complete에서 complete로 이동
    if (this.state.currentStep === "refund-complete" && step === "complete") {
      return true;
    }

    return false;
  }

  private emitStateChange(): void {
    this.eventBus.emit("formStateChanged", {
      formType: "enrollmentModification",
      step: this.state.currentStep,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
