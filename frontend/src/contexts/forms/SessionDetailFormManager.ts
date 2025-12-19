// src/contexts/forms/SessionDetailFormManager.ts
import { ContextEventBus } from "../events/ContextEventBus";

export type SessionDetailTab = "content" | "pose";

export interface SessionDetailFormState {
  selectedSessionId: number | null;
  selectedTab: SessionDetailTab;
}

export class SessionDetailFormManager {
  private state: SessionDetailFormState;
  private eventBus: ContextEventBus;
  private listeners: Set<(state: SessionDetailFormState) => void> = new Set();

  constructor(eventBus: ContextEventBus) {
    this.state = this.getInitialState();
    this.eventBus = eventBus;
  }

  // 공개 API
  getState(): SessionDetailFormState {
    return { ...this.state };
  }

  setSelectedSessionId(sessionId: number | null): void {
    this.state.selectedSessionId = sessionId;
    this.emitStateChange();
    this.notifyListeners();
  }

  setSelectedTab(tab: SessionDetailTab): void {
    this.state.selectedTab = tab;
    this.emitStateChange();
    this.notifyListeners();
  }

  reset(): void {
    this.state = this.getInitialState();
    this.emitStateChange();
    this.notifyListeners();
  }

  // 구독/구독 해제
  subscribe(listener: (state: SessionDetailFormState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 내부 구현 (캡슐화됨)
  private getInitialState(): SessionDetailFormState {
    return {
      selectedSessionId: null,
      selectedTab: "content",
    };
  }

  private emitStateChange(): void {
    this.eventBus.emit("formStateChanged", {
      formType: "sessionDetail",
      step: this.state.selectedTab,
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
