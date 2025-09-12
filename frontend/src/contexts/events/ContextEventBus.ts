// src/contexts/events/ContextEventBus.ts
export interface EventMap {
  navigationChanged: { subPage: string | null; activeTab: number };
  formStateChanged: { formType: string; step: string };
  goBackExecuted: {
    commandId: string;
    description: string;
    context: string | null;
    action: string;
  };
  modalOpened: { modalId: string; modalType: string };
  dataUpdated: { dataType: string; data: any };
}

export class ContextEventBus {
  private listeners: Map<keyof EventMap, Function[]> = new Map();

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  subscribe<K extends keyof EventMap>(
    event: K,
    listener: (data: EventMap[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);

    return () => {
      const eventListeners = this.listeners.get(event) || [];
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    };
  }

  unsubscribeAll(event: keyof EventMap): void {
    this.listeners.delete(event);
  }

  clear(): void {
    this.listeners.clear();
  }
}

// 전역 이벤트 버스 인스턴스
export const contextEventBus = new ContextEventBus();
