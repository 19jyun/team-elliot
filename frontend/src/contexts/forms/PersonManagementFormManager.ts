// src/contexts/forms/PersonManagementFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type PrincipalPersonManagementStep =
  | "class-list"
  | "session-list"
  | "request-detail";

export interface PersonManagementFormState {
  currentStep: PrincipalPersonManagementStep;
  selectedTab: "enrollment" | "refund";
  selectedClassId: number | null;
  selectedSessionId: number | null;
  selectedRequestId: number | null;
  selectedRequestType: "enrollment" | "refund" | null;
}

export class PersonManagementFormManager {
  private state: PersonManagementFormState;
  private eventBus: ContextEventBus;
  private listeners: Set<(state: PersonManagementFormState) => void> =
    new Set();

  constructor(eventBus: ContextEventBus) {
    this.state = this.getInitialState();
    this.eventBus = eventBus;
  }

  // 공개 API
  getState(): PersonManagementFormState {
    return { ...this.state };
  }

  setCurrentStep(step: PrincipalPersonManagementStep): void {
    if (this.validateStep(step)) {
      this.state.currentStep = step;
      this.emitStateChange();
      this.notifyListeners();
    }
  }

  setSelectedTab(tab: "enrollment" | "refund"): void {
    this.state.selectedTab = tab;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedClassId(classId: number | null): void {
    this.state.selectedClassId = classId;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedSessionId(sessionId: number | null): void {
    this.state.selectedSessionId = sessionId;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedRequestId(requestId: number | null): void {
    this.state.selectedRequestId = requestId;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedRequestType(requestType: "enrollment" | "refund" | null): void {
    this.state.selectedRequestType = requestType;
    this.emitStateChange();
    this.notifyListeners();
  }

  reset(): void {
    this.state = this.getInitialState();
    this.emitStateChange();
    this.notifyListeners();
  }

  // 구독/구독 해제
  subscribe(listener: (state: PersonManagementFormState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 내부 구현 (캡슐화됨)
  private getInitialState(): PersonManagementFormState {
    return {
      currentStep: "class-list",
      selectedTab: "enrollment",
      selectedClassId: null,
      selectedSessionId: null,
      selectedRequestId: null,
      selectedRequestType: null,
    };
  }

  private validateStep(step: PrincipalPersonManagementStep): boolean {
    const stepOrder: PrincipalPersonManagementStep[] = [
      "class-list",
      "session-list",
      "request-detail",
    ];

    const currentIndex = stepOrder.indexOf(this.state.currentStep);
    const newIndex = stepOrder.indexOf(step);

    // 이전 단계로 돌아가거나 다음 단계로 진행하는 것만 허용
    return newIndex >= currentIndex - 1 && newIndex <= currentIndex + 1;
  }

  private emitStateChange(): void {
    this.eventBus.emit("formStateChanged", {
      formType: "personManagement",
      step: this.state.currentStep,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
