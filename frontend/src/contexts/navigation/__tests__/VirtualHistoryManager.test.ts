// src/contexts/navigation/__tests__/VirtualHistoryManager.test.ts
import { VirtualHistoryManager } from "../VirtualHistoryManager";

describe("VirtualHistoryManager", () => {
  let virtualHistory: VirtualHistoryManager;

  beforeEach(() => {
    virtualHistory = new VirtualHistoryManager(10); // 최대 10개 엔트리
  });

  describe("push", () => {
    it("should add new entry to history", () => {
      // Given
      const entry = {
        type: "navigation" as const,
        data: { title: "Test Entry", activeTab: 0 },
      };

      // When
      virtualHistory.push(entry);

      // Then
      const currentEntry = virtualHistory.getCurrentEntry();
      expect(currentEntry).toBeDefined();
      expect(currentEntry?.type).toBe("navigation");
      expect(currentEntry?.data.title).toBe("Test Entry");
    });

    it("should update current index when adding new entry", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });
      virtualHistory.push({ type: "navigation", data: { title: "Second" } });

      // When
      virtualHistory.push({ type: "navigation", data: { title: "Third" } });

      // Then
      const state = virtualHistory.getState();
      expect(state.currentIndex).toBe(2);
      expect(state.entries).toHaveLength(3);
    });

    it("should remove future entries when adding new entry", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });
      virtualHistory.push({ type: "navigation", data: { title: "Second" } });
      virtualHistory.goBack(); // currentIndex = 0

      // When
      virtualHistory.push({
        type: "navigation",
        data: { title: "New Branch" },
      });

      // Then
      const state = virtualHistory.getState();
      expect(state.entries).toHaveLength(2);
      expect(state.currentIndex).toBe(1);
      expect(state.entries[1].data.title).toBe("New Branch");
    });

    it("should respect max size limit", () => {
      // Given: maxSize = 10
      for (let i = 0; i < 12; i++) {
        virtualHistory.push({
          type: "navigation",
          data: { title: `Entry ${i}` },
        });
      }

      // Then
      const state = virtualHistory.getState();
      expect(state.entries).toHaveLength(10);
      expect(state.entries[0].data.title).toBe("Entry 2"); // 오래된 엔트리 제거됨
      expect(state.entries[9].data.title).toBe("Entry 11");
    });
  });

  describe("goBack", () => {
    it("should move to previous entry", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });
      virtualHistory.push({ type: "navigation", data: { title: "Second" } });

      // When
      const result = virtualHistory.goBack();

      // Then
      expect(result).toBe(true);
      const currentEntry = virtualHistory.getCurrentEntry();
      expect(currentEntry?.data.title).toBe("First");
    });

    it("should return false when no previous entry", () => {
      // Given: 빈 히스토리

      // When
      const result = virtualHistory.goBack();

      // Then
      expect(result).toBe(false);
    });

    it("should return false when already at first entry", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });

      // When
      const result = virtualHistory.goBack();

      // Then
      expect(result).toBe(false);
    });
  });

  describe("goForward", () => {
    it("should move to next entry", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });
      virtualHistory.push({ type: "navigation", data: { title: "Second" } });
      virtualHistory.goBack(); // currentIndex = 0

      // When
      const result = virtualHistory.goForward();

      // Then
      expect(result).toBe(true);
      const currentEntry = virtualHistory.getCurrentEntry();
      expect(currentEntry?.data.title).toBe("Second");
    });

    it("should return false when no next entry", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });

      // When
      const result = virtualHistory.goForward();

      // Then
      expect(result).toBe(false);
    });
  });

  describe("canGoBack", () => {
    it("should return true when previous entry exists", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });
      virtualHistory.push({ type: "navigation", data: { title: "Second" } });

      // When & Then
      expect(virtualHistory.canGoBack()).toBe(true);
    });

    it("should return false when no previous entry", () => {
      // Given: 빈 히스토리

      // When & Then
      expect(virtualHistory.canGoBack()).toBe(false);
    });
  });

  describe("canGoForward", () => {
    it("should return true when next entry exists", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });
      virtualHistory.push({ type: "navigation", data: { title: "Second" } });
      virtualHistory.goBack(); // currentIndex = 0

      // When & Then
      expect(virtualHistory.canGoForward()).toBe(true);
    });

    it("should return false when no next entry", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });

      // When & Then
      expect(virtualHistory.canGoForward()).toBe(false);
    });
  });

  describe("getPreviousEntry", () => {
    it("should return previous entry", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });
      virtualHistory.push({ type: "navigation", data: { title: "Second" } });

      // When
      const previousEntry = virtualHistory.getPreviousEntry();

      // Then
      expect(previousEntry?.data.title).toBe("First");
    });

    it("should return null when no previous entry", () => {
      // Given: 빈 히스토리

      // When
      const previousEntry = virtualHistory.getPreviousEntry();

      // Then
      expect(previousEntry).toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear all entries", () => {
      // Given
      virtualHistory.push({ type: "navigation", data: { title: "First" } });
      virtualHistory.push({ type: "navigation", data: { title: "Second" } });

      // When
      virtualHistory.clear();

      // Then
      const state = virtualHistory.getState();
      expect(state.entries).toHaveLength(0);
      expect(state.currentIndex).toBe(-1);
    });
  });

  describe("subscription", () => {
    it("should notify listeners on state change", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = virtualHistory.subscribe(listener);

      // When
      virtualHistory.push({ type: "navigation", data: { title: "Test" } });

      // Then
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          entries: expect.any(Array),
          currentIndex: 0,
          maxSize: 10,
        })
      );

      // Cleanup
      unsubscribe();
    });

    it("should allow unsubscribing", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = virtualHistory.subscribe(listener);
      unsubscribe();

      // When
      virtualHistory.push({ type: "navigation", data: { title: "Test" } });

      // Then
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
