/**
 * 환경별 Storage 어댑터
 * Capacitor 환경에서는 Capacitor Storage 사용
 * 웹 환경에서는 localStorage 사용
 */

// Capacitor 환경 감지
const isCapacitor = (): boolean => {
  if (typeof window === "undefined") return false;

  // Capacitor 객체 존재 확인
  const hasCapacitor =
    "Capacitor" in window &&
    typeof (window as { Capacitor?: unknown }).Capacitor !== "undefined";

  // 프로토콜 확인
  const isCapacitorProtocol = window.location.protocol === "capacitor:";

  return hasCapacitor || isCapacitorProtocol;
};

// Capacitor Storage 인터페이스
interface CapacitorStorage {
  get: (options: { key: string }) => Promise<{ value: string | null }>;
  set: (options: { key: string; value: string }) => Promise<void>;
  remove: (options: { key: string }) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * 통합 Storage 인터페이스
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * localStorage 기반 Storage 어댑터
 */
class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.clear();
  }
}

/**
 * Capacitor Storage 기반 어댑터
 */
class CapacitorStorageAdapter implements StorageAdapter {
  private storage: CapacitorStorage;

  constructor() {
    // Capacitor 7.x에서는 Storage가 내장되어 있음
    const capacitor = (window as { Capacitor?: { Storage?: CapacitorStorage } })
      .Capacitor;
    const storage = capacitor?.Storage;
    if (!storage) {
      throw new Error("Capacitor Storage is not available");
    }
    this.storage = storage;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const result = await this.storage.get({ key });
      return result.value;
    } catch (error) {
      console.error("Capacitor Storage getItem error:", error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.storage.set({ key, value });
    } catch (error) {
      console.error("Capacitor Storage setItem error:", error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.storage.remove({ key });
    } catch (error) {
      console.error("Capacitor Storage removeItem error:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.storage.clear();
    } catch (error) {
      console.error("Capacitor Storage clear error:", error);
    }
  }
}

/**
 * 환경에 따른 Storage 어댑터 팩토리
 */
export const createStorageAdapter = (): StorageAdapter => {
  if (isCapacitor()) {
    try {
      return new CapacitorStorageAdapter();
    } catch (error) {
      console.warn(
        "Capacitor Storage not available, falling back to localStorage:",
        error
      );
      return new LocalStorageAdapter();
    }
  }
  return new LocalStorageAdapter();
};

/**
 * 전역 Storage 어댑터 인스턴스
 */
export const storageAdapter = createStorageAdapter();

/**
 * 동기식 Storage 래퍼 (기존 코드 호환성)
 * 주의: 이 함수들은 Promise를 반환하므로 await 필요
 */
export const Storage = {
  getItem: (key: string): Promise<string | null> => storageAdapter.getItem(key),
  setItem: (key: string, value: string): Promise<void> =>
    storageAdapter.setItem(key, value),
  removeItem: (key: string): Promise<void> => storageAdapter.removeItem(key),
  clear: (): Promise<void> => storageAdapter.clear(),
};

/**
 * 동기식 Storage 래퍼 (기존 localStorage API와 동일)
 * 내부적으로는 비동기이지만 동기식 API 제공
 */
export const SyncStorage = {
  getItem: (key: string): string | null => {
    // 동기식으로 처리하기 위해 즉시 반환 (캐시된 값)
    if (typeof window === "undefined") return null;

    if (isCapacitor()) {
      // Capacitor 환경에서는 localStorage를 캐시로 사용
      return localStorage.getItem(key);
    }
    return localStorage.getItem(key);
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;

    if (isCapacitor()) {
      // Capacitor 환경에서는 localStorage를 캐시로 사용하고 비동기로 저장
      localStorage.setItem(key, value);
      storageAdapter.setItem(key, value).catch(console.error);
    } else {
      localStorage.setItem(key, value);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;

    if (isCapacitor()) {
      localStorage.removeItem(key);
      storageAdapter.removeItem(key).catch(console.error);
    } else {
      localStorage.removeItem(key);
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;

    if (isCapacitor()) {
      localStorage.clear();
      storageAdapter.clear().catch(console.error);
    } else {
      localStorage.clear();
    }
  },
};
