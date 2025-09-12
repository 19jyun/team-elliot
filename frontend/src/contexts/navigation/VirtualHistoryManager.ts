// src/contexts/navigation/VirtualHistoryManager.ts
export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: "navigation" | "subpage" | "form-step";
  data: {
    activeTab?: number;
    subPage?: string | null;
    formType?: string;
    formStep?: string;
    formData?: Record<string, any>;
    title?: string;
    description?: string;
  };
}

export interface VirtualHistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  maxSize: number;
}

export class VirtualHistoryManager {
  private state: VirtualHistoryState;
  private listeners: Set<(state: VirtualHistoryState) => void> = new Set();

  constructor(maxSize: number = 50) {
    this.state = {
      entries: [],
      currentIndex: -1,
      maxSize,
    };
  }

  // 공개 API
  push(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.addEntry(newEntry);
    this.notifyListeners();
  }

  goBack(): boolean {
    if (this.state.currentIndex > 0) {
      this.state.currentIndex--;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  goForward(): boolean {
    if (this.state.currentIndex < this.state.entries.length - 1) {
      this.state.currentIndex++;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  canGoBack(): boolean {
    return this.state.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.state.currentIndex < this.state.entries.length - 1;
  }

  getCurrentEntry(): HistoryEntry | null {
    return this.state.entries[this.state.currentIndex] || null;
  }

  getPreviousEntry(): HistoryEntry | null {
    return this.state.entries[this.state.currentIndex - 1] || null;
  }

  getState(): VirtualHistoryState {
    return { ...this.state };
  }

  clear(): void {
    this.state = {
      entries: [],
      currentIndex: -1,
      maxSize: this.state.maxSize,
    };
    this.notifyListeners();
  }

  // 내부 구현 (캡슐화됨)
  private addEntry(entry: HistoryEntry): void {
    const newIndex = this.state.currentIndex + 1;

    // 현재 인덱스 이후의 엔트리들 제거 (새로운 브랜치)
    this.state.entries.splice(newIndex);
    this.state.entries.push(entry);
    this.state.currentIndex = this.state.entries.length - 1;

    // 최대 크기 초과 시 오래된 엔트리 제거
    if (this.state.entries.length > this.state.maxSize) {
      this.state.entries.shift();
      this.state.currentIndex--;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // 구독/구독 해제
  subscribe(listener: (state: VirtualHistoryState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
