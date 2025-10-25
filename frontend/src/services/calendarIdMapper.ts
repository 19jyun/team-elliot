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
      if (!stored) return new Map();

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        console.warn(
          "CalendarIdMapper: 저장된 데이터가 배열이 아닙니다. 초기화합니다."
        );
        return new Map();
      }

      return new Map(parsed);
    } catch (error) {
      console.error("CalendarIdMapper: localStorage 로드 실패:", error);
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
  getNativeId(sessionId: string | number): string | undefined {
    return this.eventMap.get(String(sessionId));
  }

  // 세션 ID 조회 (거의 쓸 일 없음)
  getSessionId(nativeEventId: string): string | undefined {
    for (const [key, value] of this.eventMap.entries()) {
      if (value === nativeEventId) return key;
    }
    return undefined;
  }

  // 매핑 저장
  setMapping(sessionId: string | number, nativeEventId: string): void {
    const sessionIdStr = String(sessionId);

    // 중복 매핑 방지
    if (this.eventMap.has(sessionIdStr)) {
      console.warn(
        `CalendarIdMapper: 세션 ${sessionIdStr}에 대한 매핑이 이미 존재합니다. 덮어씁니다.`
      );
    }

    // 네이티브 ID 중복 검사
    const existingSessionId = this.getSessionId(nativeEventId);
    if (existingSessionId && existingSessionId !== sessionIdStr) {
      console.warn(
        `CalendarIdMapper: 네이티브 ID ${nativeEventId}가 이미 세션 ${existingSessionId}에 매핑되어 있습니다.`
      );
    }

    this.eventMap.set(sessionIdStr, nativeEventId);
    this.saveToStorage();
  }

  // 매핑 삭제
  removeMapping(sessionId: string | number): void {
    this.eventMap.delete(String(sessionId));
    this.saveToStorage();
  }

  // 전체 삭제
  clearAll(): void {
    this.eventMap.clear();
    this.saveToStorage();
  }

  // 디버깅용: 모든 매핑 조회
  getAllMappings(): Array<[string, string]> {
    return Array.from(this.eventMap.entries());
  }

  // 디버깅용: 매핑 상태 확인
  getMappingStatus(): {
    totalMappings: number;
    mappings: Array<{ sessionId: string; nativeEventId: string }>;
  } {
    return {
      totalMappings: this.eventMap.size,
      mappings: Array.from(this.eventMap.entries()).map(
        ([sessionId, nativeEventId]) => ({
          sessionId,
          nativeEventId,
        })
      ),
    };
  }
}

export const calendarIdMapper = new CalendarIdMapper();
