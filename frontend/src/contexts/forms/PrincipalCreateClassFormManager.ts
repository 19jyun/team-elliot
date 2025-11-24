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
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
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
    this.state.currentStep = step;
    this.emitStateChange();
    this.notifyListeners();
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

  // 편의 메서드: Step별 데이터 설정
  setInfo(data: {
    name: string;
    description: string;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    maxStudents: number;
    price: number;
  }): void {
    this.state.classFormData = {
      ...this.state.classFormData,
      ...data,
    };
    this.emitStateChange();
    this.notifyListeners();
  }

  setTeacher(teacherId: number): void {
    this.state.selectedTeacherId = teacherId;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSchedule(data: {
    startDate: string;
    endDate: string;
    schedules: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[];
  }): void {
    this.state.classFormData = {
      ...this.state.classFormData,
      startDate: data.startDate,
      endDate: data.endDate,
      schedule: data.schedules,
    };
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
        level: "BEGINNER",
        maxStudents: 0,
        price: 0,
        startDate: "",
        endDate: "",
        schedule: [],
      },
      selectedTeacherId: null,
    };
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
