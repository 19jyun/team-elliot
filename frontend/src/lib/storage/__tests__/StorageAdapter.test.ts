/**
 * StorageAdapter 테스트
 */

import { createStorageAdapter, SyncStorage } from "../StorageAdapter";

// localStorage 모킹
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// window 객체 모킹
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Capacitor 모킹
const mockCapacitorStorage = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
};

describe("StorageAdapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 기본적으로 웹 환경으로 설정
    Object.defineProperty(window, "location", {
      value: { protocol: "http:" },
      writable: true,
    });
    delete (window as { Capacitor?: unknown }).Capacitor;
  });

  describe("웹 환경 (localStorage)", () => {
    it("should use localStorage in web environment", () => {
      const _adapter = createStorageAdapter();

      // localStorage 메서드가 호출되는지 확인
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();

      // SyncStorage 사용 테스트
      SyncStorage.setItem("test", "value");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test", "value");
    });
  });

  describe("Capacitor 환경", () => {
    beforeEach(() => {
      // Capacitor 환경 설정
      Object.defineProperty(window, "location", {
        value: { protocol: "capacitor:" },
        writable: true,
      });
      (window as { Capacitor?: { Storage?: unknown } }).Capacitor = {
        Storage: mockCapacitorStorage,
      };
    });

    it("should use Capacitor Storage in Capacitor environment", async () => {
      mockCapacitorStorage.get.mockResolvedValue({ value: "test-value" });

      const adapter = createStorageAdapter();
      const result = await adapter.getItem("test-key");

      expect(mockCapacitorStorage.get).toHaveBeenCalledWith({
        key: "test-key",
      });
      expect(result).toBe("test-value");
    });

    it("should fallback to localStorage if Capacitor Storage fails", () => {
      // Capacitor Storage를 사용할 수 없는 상황
      delete (window as { Capacitor?: unknown }).Capacitor;

      const _adapter = createStorageAdapter();

      // localStorage를 사용해야 함
      SyncStorage.setItem("test", "value");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test", "value");
    });
  });

  describe("SyncStorage", () => {
    it("should work synchronously in web environment", () => {
      SyncStorage.setItem("key", "value");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("key", "value");

      mockLocalStorage.getItem.mockReturnValue("value");
      const result = SyncStorage.getItem("key");
      expect(result).toBe("value");
    });

    it("should handle Capacitor environment with localStorage cache", () => {
      // Capacitor 환경 설정
      Object.defineProperty(window, "location", {
        value: { protocol: "capacitor:" },
        writable: true,
      });

      SyncStorage.setItem("key", "value");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("key", "value");

      mockLocalStorage.getItem.mockReturnValue("value");
      const result = SyncStorage.getItem("key");
      expect(result).toBe("value");
    });
  });
});
