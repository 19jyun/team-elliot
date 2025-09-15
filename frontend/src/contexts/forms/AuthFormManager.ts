// src/contexts/forms/AuthFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type AuthMode = "login" | "signup";
export type SignupStep =
  | "role-selection"
  | "personal-info"
  | "account-info"
  | "terms";

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

  // Auth 관련 특수 메서드들
  navigateToAuthSubPage(page: string): void {
    this.state.authSubPage = page;
    this.emitStateChange();
    this.notifyListeners();
  }

  goBackFromAuth(): void {
    this.state.authSubPage = null;
    this.emitStateChange();
    this.notifyListeners();
  }

  clearAuthSubPage(): void {
    this.state.authSubPage = null;
    this.emitStateChange();
    this.notifyListeners();
  }

  resetSignup(): void {
    this.state.signup = this.getInitialSignupState();
    this.emitStateChange();
    this.notifyListeners();
  }

  resetLogin(): void {
    this.state.login = this.getInitialLoginState();
    this.emitStateChange();
    this.notifyListeners();
  }

  // 유효성 검사
  validateSignupStep(step: SignupStep): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (step) {
      case "role-selection":
        if (!this.state.signup.role) {
          errors.push("역할을 선택해주세요.");
        }
        break;
      case "personal-info":
        if (!this.state.signup.personalInfo.name.trim()) {
          errors.push("이름을 입력해주세요.");
        }
        if (!this.state.signup.personalInfo.phoneNumber.trim()) {
          errors.push("전화번호를 입력해주세요.");
        }
        break;
      case "account-info":
        if (!this.state.signup.accountInfo.userId.trim()) {
          errors.push("아이디를 입력해주세요.");
        }
        if (!this.state.signup.accountInfo.password.trim()) {
          errors.push("비밀번호를 입력해주세요.");
        }
        if (
          this.state.signup.accountInfo.password !==
          this.state.signup.accountInfo.confirmPassword
        ) {
          errors.push("비밀번호가 일치하지 않습니다.");
        }
        break;
      case "terms":
        if (!this.state.signup.terms.age) {
          errors.push("나이 확인에 동의해주세요.");
        }
        if (!this.state.signup.terms.terms1) {
          errors.push("이용약관에 동의해주세요.");
        }
        if (!this.state.signup.terms.terms2) {
          errors.push("개인정보처리방침에 동의해주세요.");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateLogin(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.state.login.userId.trim()) {
      errors.push("아이디를 입력해주세요.");
    }
    if (!this.state.login.password.trim()) {
      errors.push("비밀번호를 입력해주세요.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  canProceedToNextSignupStep(): boolean {
    const validation = this.validateSignupStep(this.state.signup.step);
    return validation.isValid;
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
      signup: this.getInitialSignupState(),
      login: this.getInitialLoginState(),
    };
  }

  private getInitialSignupState() {
    return {
      step: "role-selection" as SignupStep,
      role: null as "STUDENT" | "TEACHER" | null,
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
    };
  }

  private getInitialLoginState() {
    return {
      userId: "",
      password: "",
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
