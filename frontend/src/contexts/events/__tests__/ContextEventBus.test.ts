// src/contexts/events/__tests__/ContextEventBus.test.ts
import { ContextEventBus } from "../ContextEventBus";

describe("ContextEventBus", () => {
  let eventBus: ContextEventBus;

  beforeEach(() => {
    eventBus = new ContextEventBus();
  });

  describe("emit and subscribe", () => {
    it("should emit and receive navigationChanged event", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe("navigationChanged", listener);

      // When
      eventBus.emit("navigationChanged", {
        subPage: "enroll",
        activeTab: 1,
      });

      // Then
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        subPage: "enroll",
        activeTab: 1,
      });

      // Cleanup
      unsubscribe();
    });

    it("should emit and receive formStateChanged event", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe("formStateChanged", listener);

      // When
      eventBus.emit("formStateChanged", {
        formType: "enrollment",
        step: "class-selection",
      });

      // Then
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        formType: "enrollment",
        step: "class-selection",
      });

      // Cleanup
      unsubscribe();
    });

    it("should emit and receive goBackExecuted event", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe("goBackExecuted", listener);

      // When
      eventBus.emit("goBackExecuted", {
        commandId: "test-command",
        description: "Test go back",
        context: "enrollment",
        action: "step-back",
      });

      // Then
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        commandId: "test-command",
        description: "Test go back",
        context: "enrollment",
        action: "step-back",
      });

      // Cleanup
      unsubscribe();
    });

    it("should emit and receive modalOpened event", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe("modalOpened", listener);

      // When
      eventBus.emit("modalOpened", {
        modalId: "test-modal",
        modalType: "confirmation",
      });

      // Then
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        modalId: "test-modal",
        modalType: "confirmation",
      });

      // Cleanup
      unsubscribe();
    });

    it("should emit and receive dataUpdated event", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe("dataUpdated", listener);

      // When
      eventBus.emit("dataUpdated", {
        dataType: "classes",
        data: { id: 1, name: "Test Class" },
      });

      // Then
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        dataType: "classes",
        data: { id: 1, name: "Test Class" },
      });

      // Cleanup
      unsubscribe();
    });
  });

  describe("multiple listeners", () => {
    it("should notify multiple listeners for same event", () => {
      // Given
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const unsubscribe1 = eventBus.subscribe("navigationChanged", listener1);
      const unsubscribe2 = eventBus.subscribe("navigationChanged", listener2);

      // When
      eventBus.emit("navigationChanged", {
        subPage: "enroll",
        activeTab: 1,
      });

      // Then
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      // Cleanup
      unsubscribe1();
      unsubscribe2();
    });

    it("should handle listener errors gracefully", () => {
      // Given
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error("Listener error");
      });
      const normalListener = jest.fn();

      const unsubscribe1 = eventBus.subscribe(
        "navigationChanged",
        errorListener
      );
      const unsubscribe2 = eventBus.subscribe(
        "navigationChanged",
        normalListener
      );

      // Mock console.error to avoid test output
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // When
      eventBus.emit("navigationChanged", {
        subPage: "enroll",
        activeTab: 1,
      });

      // Then
      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(normalListener).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in event listener for navigationChanged:",
        expect.any(Error)
      );

      // Cleanup
      unsubscribe1();
      unsubscribe2();
      consoleSpy.mockRestore();
    });
  });

  describe("unsubscribe", () => {
    it("should remove listener when unsubscribed", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe("navigationChanged", listener);
      unsubscribe();

      // When
      eventBus.emit("navigationChanged", {
        subPage: "enroll",
        activeTab: 1,
      });

      // Then
      expect(listener).not.toHaveBeenCalled();
    });

    it("should handle multiple unsubscribes gracefully", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = eventBus.subscribe("navigationChanged", listener);
      unsubscribe();
      unsubscribe(); // Second unsubscribe should not throw

      // When
      eventBus.emit("navigationChanged", {
        subPage: "enroll",
        activeTab: 1,
      });

      // Then
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribeAll", () => {
    it("should remove all listeners for specific event", () => {
      // Given
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      eventBus.subscribe("navigationChanged", listener1);
      eventBus.subscribe("navigationChanged", listener2);

      // When
      eventBus.unsubscribeAll("navigationChanged");

      // Then
      eventBus.emit("navigationChanged", {
        subPage: "enroll",
        activeTab: 1,
      });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("should remove all listeners for all events", () => {
      // Given
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      eventBus.subscribe("navigationChanged", listener1);
      eventBus.subscribe("formStateChanged", listener2);

      // When
      eventBus.clear();

      // Then
      eventBus.emit("navigationChanged", { subPage: "enroll", activeTab: 1 });
      eventBus.emit("formStateChanged", {
        formType: "enrollment",
        step: "class-selection",
      });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe("no listeners", () => {
    it("should handle emit when no listeners exist", () => {
      // Given: No listeners subscribed

      // When & Then: Should not throw
      expect(() => {
        eventBus.emit("navigationChanged", {
          subPage: "enroll",
          activeTab: 1,
        });
      }).not.toThrow();
    });
  });
});
