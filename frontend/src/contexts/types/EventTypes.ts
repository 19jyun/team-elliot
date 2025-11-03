// src/contexts/types/EventTypes.ts
// 이벤트 관련 타입 정의

export interface EventMap {
  navigationChanged: { subPage: string | null; activeTab: number };
  tabChanged: { activeTab: number };
  formStateChanged: { formType: string; step: string };
  goBackExecuted: {
    commandId: string;
    description: string;
    context: string | null;
    action: string;
  };
  modalOpened: { modalId: string; modalType: string };
  dataUpdated: { dataType: string; data: unknown };
}

// 이벤트 리스너 타입
export type EventListener<T extends keyof EventMap> = (
  data: EventMap[T]
) => void;

// 이벤트 구독 해제 함수 타입
export type UnsubscribeFunction = () => void;
