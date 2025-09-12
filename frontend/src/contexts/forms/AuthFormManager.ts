// src/contexts/forms/AuthFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type AuthMode = "login" | "signup";
export type SignupStep =
  | "signup-role"
  | "signup-personal"
  | "signup-account"
  | "signup-terms";

export interface SignupData {
  step: SignupStep;
  role: "STUDENT" | "TEACHER" | null;
  personalInfo: {
    name: string;
    phoneNumber: string;
  };
  accountInfo: {
    userId: string;
    password: string;
    confirmPassword: string;
  };
  terms: {
    age: boolean;
    terms1: boolean;
    terms2: boolean;
    marketing: boolean;
  };
}

export interface LoginData {
  userId: string;
  password: string;
}

export interface AuthFormState {
  authMode: AuthMode;
  authSubPage: string | null;
  signup: SignupData;
  login: LoginData;
}

export class AuthFormManager {
  private state: AuthFormState;
  private eventBus: ContextEventBus;
  private listeners: Set<(state: AuthFormState) => void> = new Set();

  constructor(eventBus: ContextEventBus) {
    this.state = this.getInitialState();
    this.eventBus = eventBus;
  }

  // 공개 API
  getState(): AuthFormState {
    return { ...this.state };
  }

  setAuthMode(mode: AuthMode): void {
    this.state.authMode = mode;
    this.emitStateChange();
    this.notifyListeners();
  }

  setAuthSubPage(page: string | null): void {
    this.state.authSubPage = page;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSignupStep(step: SignupStep): void {
    this.state.signup.step = step;
    this.emitStateChange();
    this.notifyListeners();
  }

  setRole(role: "STUDENT" | "TEACHER"): void {
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

  setLoginInfo(info: { userId: string; password: string }): void {
    this.state.login = info;
    this.emitStateChange();
    this.notifyListeners();
  }

  reset(): void {
    this.state = this.getInitialState();
    this.emitStateChange();
    this.notifyListeners();
  }

  // 구독/구독 해제
  subscribe(listener: (state: AuthFormState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 내부 구현 (캡슐화됨)
  private getInitialState(): AuthFormState {
    return {
      authMode: "login",
      authSubPage: null,
      signup: {
        step: "signup-role",
        role: null,
        personalInfo: {
          name: "",
          phoneNumber: "",
        },
        accountInfo: {
          userId: "",
          password: "",
          confirmPassword: "",
        },
        terms: {
          age: false,
          terms1: false,
          terms2: false,
          marketing: false,
        },
      },
      login: {
        userId: "",
        password: "",
      },
    };
  }

  private emitStateChange(): void {
    this.eventBus.emit("formStateChanged", {
      formType: "auth",
      step: this.state.authMode === "login" ? "login" : this.state.signup.step,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
