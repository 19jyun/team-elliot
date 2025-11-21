// src/contexts/forms/AuthFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type SignupStep =
  | "role-selection"
  | "personal-info"
  | "account-info"
  | "academy-info" // Principal 전용
  | "terms";

export interface SignupData {
  step: SignupStep;
  role: "STUDENT" | "TEACHER" | "PRINCIPAL" | null;
  personalInfo: {
    name: string;
    phoneNumber: string;
  };
  accountInfo: {
    userId: string;
    password: string;
    confirmPassword: string;
  };
  academyInfo?: {
    name: string;
    phoneNumber: string;
    address: string;
    description: string;
  };
  terms: {
    age: boolean;
    terms1: boolean;
    terms2: boolean;
    marketing: boolean;
  };
}

export interface AuthFormState {
  // [삭제됨] authMode, authSubPage
  signup: SignupData;
}

export class AuthFormManager {
  private state: AuthFormState;
  private eventBus: ContextEventBus;
  private listeners: Set<(state: AuthFormState) => void> = new Set();

  constructor(eventBus: ContextEventBus) {
    this.state = this.getInitialState();
    this.eventBus = eventBus;
  }

  // --- 공개 API ---

  getState(): AuthFormState {
    return { ...this.state };
  }

  // [Signup Data Setters] - 데이터 저장 메서드만 유지
  setSignupStep(step: SignupStep): void {
    this.state.signup.step = step;
    this.emitStateChange();
    this.notifyListeners();
  }

  setRole(role: "STUDENT" | "TEACHER" | "PRINCIPAL"): void {
    this.state.signup.role = role;
    this.emitStateChange();
    this.notifyListeners();
  }

  setPersonalInfo(info: { name: string; phoneNumber: string }): void {
    this.state.signup.personalInfo = info;
    this.emitStateChange();
    this.notifyListeners();
  }

  setAccountInfo(info: {
    userId: string;
    password: string;
    confirmPassword: string;
  }): void {
    this.state.signup.accountInfo = info;
    this.emitStateChange();
    this.notifyListeners();
  }

  setAcademyInfo(info: {
    name: string;
    phoneNumber: string;
    address: string;
    description: string;
  }): void {
    this.state.signup.academyInfo = info;
    this.emitStateChange();
    this.notifyListeners();
  }

  setTerms(terms: {
    age: boolean;
    terms1: boolean;
    terms2: boolean;
    marketing: boolean;
  }): void {
    this.state.signup.terms = terms;
    this.emitStateChange();
    this.notifyListeners();
  }

  // [Resets]
  resetSignup(): void {
    this.state.signup = this.getInitialSignupState();
    this.emitStateChange();
    this.notifyListeners();
  }

  reset(): void {
    this.state = this.getInitialState();
    this.emitStateChange();
    this.notifyListeners();
  }

  // [Subscriptions]
  subscribe(listener: (state: AuthFormState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- 내부 구현 ---

  private getInitialState(): AuthFormState {
    return {
      // [삭제됨] authSubPage: null
      signup: this.getInitialSignupState(),
    };
  }

  private getInitialSignupState() {
    return {
      step: "role-selection" as SignupStep,
      role: null as "STUDENT" | "TEACHER" | null,
      personalInfo: { name: "", phoneNumber: "" },
      accountInfo: { userId: "", password: "", confirmPassword: "" },
      terms: { age: false, terms1: false, terms2: false, marketing: false },
    };
  }

  private emitStateChange(): void {
    this.eventBus.emit("formStateChanged", {
      formType: "auth",
      step: this.state.signup.step,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
