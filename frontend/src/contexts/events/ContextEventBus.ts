// src/contexts/events/ContextEventBus.ts
import {
  EventMap,
  EventListener,
  UnsubscribeFunction,
} from "../types/EventTypes";

export class ContextEventBus {
  private listeners: Map<
    keyof EventMap,
    ((data: EventMap[keyof EventMap]) => void)[]
  > = new Map();

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
    listener: EventListener<K>
  ): UnsubscribeFunction {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners
      .get(event)!
      .push(listener as (data: EventMap[keyof EventMap]) => void);

    return () => {
      const eventListeners = this.listeners.get(event) || [];
      const index = eventListeners.indexOf(
        listener as (data: EventMap[keyof EventMap]) => void
      );
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
