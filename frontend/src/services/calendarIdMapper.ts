// services/calendarIdMapper.ts

class CalendarIdMapper {
  private static STORAGE_KEY = "calendarEventMap";
  private eventMap: Map<string, string>; // <sessionId, nativeEventId>

  constructor() {
    this.eventMap = this.loadFromStorage();
  }

  private loadFromStorage(): Map<string, string> {
    try {
      const stored = localStorage.getItem(CalendarIdMapper.STORAGE_KEY);
      return stored ? new Map(JSON.parse(stored)) : new Map();
    } catch {
      return new Map();
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(
        CalendarIdMapper.STORAGE_KEY,
        JSON.stringify(Array.from(this.eventMap.entries()))
      );
    } catch (e) {
      console.error("Failed to save event map", e);
    }
  }

  // 네이티브 ID 조회
  getNativeId(sessionId: string): string | undefined {
    return this.eventMap.get(sessionId.toString());
  }

  // 세션 ID 조회 (거의 쓸 일 없음)
  getSessionId(nativeEventId: string): string | undefined {
    for (const [key, value] of this.eventMap.entries()) {
      if (value === nativeEventId) return key;
    }
    return undefined;
  }

  // 매핑 저장
  setMapping(sessionId: string, nativeEventId: string): void {
    this.eventMap.set(sessionId.toString(), nativeEventId);
    this.saveToStorage();
  }

  // 매핑 삭제
  removeMapping(sessionId: string): void {
    this.eventMap.delete(sessionId.toString());
    this.saveToStorage();
  }

  // 전체 삭제
  clearAll(): void {
    this.eventMap.clear();
    this.saveToStorage();
  }
}

export const calendarIdMapper = new CalendarIdMapper();
