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
    this.state.currentStep = step;
    this.emitStateChange();
    this.notifyListeners();
  }

  setModificationData(data: EnrollmentModificationData | null): void {
    this.state.modificationData = data;
    this.emitStateChange();
    this.notifyListeners();
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
