// src/contexts/forms/PrincipalCreateClassFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type PrincipalCreateClassStep =
  | "info"
  | "teacher"
  | "schedule"
  | "content"
  | "complete";

export interface PrincipalClassFormData {
  name: string;
  description: string;
  maxStudents: number;
  price: number;
  startDate: string;
  endDate: string;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export interface PrincipalCreateClassFormState {
  currentStep: PrincipalCreateClassStep;
  classFormData: PrincipalClassFormData;
  selectedTeacherId: number | null;
}

export class PrincipalCreateClassFormManager {
  private state: PrincipalCreateClassFormState;
  private eventBus: ContextEventBus;
  private listeners: Set<(state: PrincipalCreateClassFormState) => void> =
    new Set();

  constructor(eventBus: ContextEventBus) {
    this.state = this.getInitialState();
    this.eventBus = eventBus;
  }

  // 공개 API
  getState(): PrincipalCreateClassFormState {
    return { ...this.state };
  }

  setCurrentStep(step: PrincipalCreateClassStep): void {
    if (this.validateStep(step)) {
      this.state.currentStep = step;
      this.emitStateChange();
      this.notifyListeners();
    }
  }

  setClassFormData(data: Partial<PrincipalClassFormData>): void {
    this.state.classFormData = { ...this.state.classFormData, ...data };
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedTeacherId(teacherId: number | null): void {
    this.state.selectedTeacherId = teacherId;
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
    listener: (state: PrincipalCreateClassFormState) => void
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 내부 구현 (캡슐화됨)
  private getInitialState(): PrincipalCreateClassFormState {
    return {
      currentStep: "info",
      classFormData: {
        name: "",
        description: "",
        maxStudents: 0,
        price: 0,
        startDate: "",
        endDate: "",
        schedule: [],
      },
      selectedTeacherId: null,
    };
  }

  private validateStep(step: PrincipalCreateClassStep): boolean {
    const stepOrder: PrincipalCreateClassStep[] = [
      "info",
      "teacher",
      "schedule",
      "content",
      "complete",
    ];

    const currentIndex = stepOrder.indexOf(this.state.currentStep);
    const newIndex = stepOrder.indexOf(step);

    // 이전 단계로 돌아가거나 다음 단계로 진행하는 것만 허용
    return newIndex >= currentIndex - 1 && newIndex <= currentIndex + 1;
  }

  private emitStateChange(): void {
    this.eventBus.emit("formStateChanged", {
      formType: "principalCreateClass",
      step: this.state.currentStep,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
