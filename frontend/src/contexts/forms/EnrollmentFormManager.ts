// src/contexts/forms/EnrollmentFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type EnrollmentStep =
  | "academy-selection"
  | "class-selection"
  | "date-selection"
  | "payment"
  | "complete"
  | "refund-request"
  | "refund-complete";

// 수강 변경 계산 데이터 타입
export interface EnrollmentModificationData {
  changeType: "additional_payment" | "refund" | "no_change";
  changeAmount: number;
  netChangeCount: number;
  newSessionsCount: number;
  cancelledSessionsCount: number;
  sessionPrice: number;
  selectedSessionIds: number[];
  // 기존 수강 정보 (비교용)
  originalEnrollments: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    isAlreadyEnrolled?: boolean;
    enrollment?: {
      id: number;
      status: string;
      enrolledAt: string;
    };
  }>;
}

export interface ClassesWithSessionsByMonthResponse {
  month: number;
  classes: {
    classId: number;
    className: string;
    level: string;
    tuitionFee: string;
    teacher: { id: number; name: string };
    academy: { id: number; name: string };
    sessions: SessionData[];
  }[];
}

export interface SessionData {
  sessionId: number;
  sessionName: string;
  startTime: string;
  endTime: string;
  date: string;
}

export interface ExtendedSessionData extends SessionData {
  isAlreadyEnrolled: boolean;
  isEnrollable: boolean;
  class: {
    id: number;
    className: string;
    level: string;
    tuitionFee: string;
    teacher: {
      id: number;
      name: string;
    };
    academy: {
      id: number;
      name: string;
    };
  };
}

export interface EnrollmentFormState {
  currentStep: EnrollmentStep;
  selectedMonth: number | null;
  selectedClasses: ClassesWithSessionsByMonthResponse[];
  selectedSessions: ExtendedSessionData[];
  selectedClassIds: number[];
  selectedAcademyId: number | null;
  selectedClassesWithSessions: ClassesWithSessionsByMonthResponse[];
  // 수강 변경 관련 상태
  modificationData: EnrollmentModificationData | null;
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
    if (this.canNavigateToStep(step)) {
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

  setSelectedSessions(sessions: ExtendedSessionData[]): void {
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

  setModificationData(data: EnrollmentModificationData | null): void {
    this.state.modificationData = data;
    this.emitStateChange();
    this.notifyListeners();
  }

  // 유효성 검사
  validateStep(step: EnrollmentStep): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (step) {
      case "academy-selection":
        if (!this.state.selectedAcademyId) {
          errors.push("학원을 선택해주세요.");
        }
        break;
      case "class-selection":
        if (this.state.selectedClassIds.length === 0) {
          errors.push("최소 하나의 클래스를 선택해주세요.");
        }
        if (!this.state.selectedAcademyId) {
          errors.push("학원을 선택해주세요.");
        }
        break;
      case "date-selection":
        if (this.state.selectedSessions.length === 0) {
          errors.push("최소 하나의 세션을 선택해주세요.");
        }
        break;
      case "payment":
        if (this.state.selectedClassesWithSessions.length === 0) {
          errors.push("선택된 클래스와 세션이 없습니다.");
        }
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

  // 성능 최적화: 상태 변경이 실제로 필요한지 확인
  shouldUpdateState(newState: Partial<EnrollmentFormState>): boolean {
    const currentState = this.state;

    // 현재 상태와 새 상태를 비교하여 실제 변경사항이 있는지 확인
    for (const key in newState) {
      if (key in currentState) {
        const currentValue = currentState[key as keyof EnrollmentFormState];
        const newValue = newState[key as keyof EnrollmentFormState];

        if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
          return true;
        }
      }
    }

    return false;
  }

  // 성능 최적화: 배치 업데이트
  batchUpdate(updates: Partial<EnrollmentFormState>): void {
    if (this.shouldUpdateState(updates)) {
      this.state = { ...this.state, ...updates };
      this.emitStateChange();
      this.notifyListeners();
    }
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
      modificationData: null,
    };
  }

  private canNavigateToStep(step: EnrollmentStep): boolean {
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
