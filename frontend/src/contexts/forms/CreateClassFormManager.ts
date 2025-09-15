// src/contexts/forms/CreateClassFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type CreateClassStep =
  | "info"
  | "teacher"
  | "schedule"
  | "content"
  | "complete";

export interface ClassFormData {
  name: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  maxStudents: number;
  price: number;
  content: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
  };
}

export interface CreateClassFormState {
  currentStep: CreateClassStep;
  classFormData: ClassFormData;
  selectedTeacherId: number | null;
}

export class CreateClassFormManager {
  private state: CreateClassFormState;
  private eventBus: ContextEventBus;
  private listeners: Set<(state: CreateClassFormState) => void> = new Set();

  constructor(eventBus: ContextEventBus) {
    this.state = this.getInitialState();
    this.eventBus = eventBus;
  }

  // 공개 API
  getState(): CreateClassFormState {
    return { ...this.state };
  }

  setCurrentStep(step: CreateClassStep): void {
    if (this.validateStep(step)) {
      this.state.currentStep = step;
      this.emitStateChange();
      this.notifyListeners();
    }
  }

  setClassFormData(data: Partial<ClassFormData>): void {
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
  subscribe(listener: (state: CreateClassFormState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 내부 구현 (캡슐화됨)
  private getInitialState(): CreateClassFormState {
    return {
      currentStep: "info",
      classFormData: {
        name: "",
        description: "",
        level: "BEGINNER",
        maxStudents: 0,
        price: 0,
        content: "",
        schedule: {
          days: [],
          startTime: "",
          endTime: "",
          startDate: "",
          endDate: "",
        },
      },
      selectedTeacherId: null,
    };
  }

  private validateStep(step: CreateClassStep): boolean {
    const stepOrder: CreateClassStep[] = [
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
      formType: "createClass",
      step: this.state.currentStep,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
