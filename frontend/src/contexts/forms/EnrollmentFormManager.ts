// src/contexts/forms/EnrollmentFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type EnrollmentStep =
  | "academy-selection"
  | "class-selection"
  | "date-selection"
  | "payment"
  | "complete";

export interface ClassesWithSessionsByMonthResponse {
  classId: number;
  className: string;
  sessions: SessionData[];
}

export interface SessionData {
  sessionId: number;
  sessionName: string;
  startTime: string;
  endTime: string;
  date: string;
}

export interface EnrollmentFormState {
  currentStep: EnrollmentStep;
  selectedMonth: number | null;
  selectedClasses: ClassesWithSessionsByMonthResponse[];
  selectedSessions: SessionData[];
  selectedClassIds: number[];
  selectedAcademyId: number | null;
  selectedClassesWithSessions: ClassesWithSessionsByMonthResponse[];
}

export class EnrollmentFormManager {
  private state: EnrollmentFormState;
  private eventBus: ContextEventBus;
  private listeners: Set<(state: EnrollmentFormState) => void> = new Set();

  constructor(eventBus: ContextEventBus) {
    this.state = this.getInitialState();
    this.eventBus = eventBus;
  }

  // 공개 API
  getState(): EnrollmentFormState {
    return { ...this.state };
  }

  setCurrentStep(step: EnrollmentStep): void {
    if (this.validateStep(step)) {
      this.state.currentStep = step;
      this.emitStateChange();
      this.notifyListeners();
    }
  }

  setSelectedMonth(month: number): void {
    this.state.selectedMonth = month;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedClasses(classes: ClassesWithSessionsByMonthResponse[]): void {
    this.state.selectedClasses = classes;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedSessions(sessions: SessionData[]): void {
    this.state.selectedSessions = sessions;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedClassIds(classIds: number[]): void {
    this.state.selectedClassIds = classIds;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedAcademyId(academyId: number | null): void {
    this.state.selectedAcademyId = academyId;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedClassesWithSessions(
    classes: ClassesWithSessionsByMonthResponse[]
  ): void {
    this.state.selectedClassesWithSessions = classes;
    this.emitStateChange();
    this.notifyListeners();
  }

  reset(): void {
    this.state = this.getInitialState();
    this.emitStateChange();
    this.notifyListeners();
  }

  // 구독/구독 해제
  subscribe(listener: (state: EnrollmentFormState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 내부 구현 (캡슐화됨)
  private getInitialState(): EnrollmentFormState {
    return {
      currentStep: "academy-selection",
      selectedMonth: null,
      selectedClasses: [],
      selectedSessions: [],
      selectedClassIds: [],
      selectedAcademyId: null,
      selectedClassesWithSessions: [],
    };
  }

  private validateStep(step: EnrollmentStep): boolean {
    const stepOrder: EnrollmentStep[] = [
      "academy-selection",
      "class-selection",
      "date-selection",
      "payment",
      "complete",
    ];

    const currentIndex = stepOrder.indexOf(this.state.currentStep);
    const newIndex = stepOrder.indexOf(step);

    // 이전 단계로 돌아가거나 다음 단계로 진행하는 것만 허용
    return newIndex >= currentIndex - 1 && newIndex <= currentIndex + 1;
  }

  private emitStateChange(): void {
    this.eventBus.emit("formStateChanged", {
      formType: "enrollment",
      step: this.state.currentStep,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
