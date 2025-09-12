// src/contexts/forms/__tests__/EnrollmentFormManager.test.ts
import { EnrollmentFormManager } from "../EnrollmentFormManager";
import { EnrollmentStep } from "../EnrollmentFormManager";
import { ContextEventBus } from "../../events/ContextEventBus";

describe("EnrollmentFormManager", () => {
  let manager: EnrollmentFormManager;
  let eventBus: ContextEventBus;

  beforeEach(() => {
    eventBus = new ContextEventBus();
    manager = new EnrollmentFormManager(eventBus);
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      // When
      const state = manager.getState();

      // Then
      expect(state.currentStep).toBe("main");
      expect(state.selectedMonth).toBeNull();
      expect(state.selectedClasses).toEqual([]);
      expect(state.selectedSessions).toEqual([]);
      expect(state.selectedClassIds).toEqual([]);
      expect(state.selectedAcademyId).toBeNull();
      expect(state.selectedClassesWithSessions).toEqual([]);
    });
  });

  describe("setCurrentStep", () => {
    it("should update current step", () => {
      // Given
      const newStep: EnrollmentStep = "academy-selection";

      // When
      manager.setCurrentStep(newStep);

      // Then
      expect(manager.getState().currentStep).toBe(newStep);
    });

    it("should notify listeners on step change", () => {
      // Given
      const listener = jest.fn();
      manager.subscribe(listener);

      // When
      manager.setCurrentStep("academy-selection");

      // Then
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: "academy-selection",
        })
      );
    });
  });

  describe("setSelectedMonth", () => {
    it("should update selected month", () => {
      // Given
      const month = 202412;

      // When
      manager.setSelectedMonth(month);

      // Then
      expect(manager.getState().selectedMonth).toBe(month);
    });
  });

  describe("setSelectedClasses", () => {
    it("should update selected classes", () => {
      // Given
      const classes = [
        {
          month: 202412,
          classes: [
            {
              classId: 1,
              className: "Test Class",
              level: "BEGINNER",
              tuitionFee: "50000",
              teacher: { id: 1, name: "Test Teacher" },
              academy: { id: 1, name: "Test Academy" },
              sessions: [],
            },
          ],
        },
      ];

      // When
      manager.setSelectedClasses(classes);

      // Then
      expect(manager.getState().selectedClasses).toEqual(classes);
    });
  });

  describe("setSelectedSessions", () => {
    it("should update selected sessions", () => {
      // Given
      const sessions = [
        {
          sessionId: 1,
          sessionName: "Test Session",
          startTime: "10:00",
          endTime: "11:00",
          date: "2024-12-01",
        },
      ];

      // When
      manager.setSelectedSessions(sessions);

      // Then
      expect(manager.getState().selectedSessions).toEqual(sessions);
    });
  });

  describe("setSelectedClassIds", () => {
    it("should update selected class IDs", () => {
      // Given
      const classIds = [1, 2, 3];

      // When
      manager.setSelectedClassIds(classIds);

      // Then
      expect(manager.getState().selectedClassIds).toEqual(classIds);
    });
  });

  describe("setSelectedAcademyId", () => {
    it("should update selected academy ID", () => {
      // Given
      const academyId = 1;

      // When
      manager.setSelectedAcademyId(academyId);

      // Then
      expect(manager.getState().selectedAcademyId).toBe(academyId);
    });

    it("should handle null academy ID", () => {
      // When
      manager.setSelectedAcademyId(null);

      // Then
      expect(manager.getState().selectedAcademyId).toBeNull();
    });
  });

  describe("setSelectedClassesWithSessions", () => {
    it("should update selected classes with sessions", () => {
      // Given
      const classesWithSessions = [
        {
          month: 202412,
          classes: [
            {
              classId: 1,
              className: "Test Class",
              level: "BEGINNER",
              tuitionFee: "50000",
              teacher: { id: 1, name: "Test Teacher" },
              academy: { id: 1, name: "Test Academy" },
              sessions: [
                {
                  sessionId: 1,
                  sessionName: "Test Session",
                  startTime: "10:00",
                  endTime: "11:00",
                  date: "2024-12-01",
                },
              ],
            },
          ],
        },
      ];

      // When
      manager.setSelectedClassesWithSessions(classesWithSessions);

      // Then
      expect(manager.getState().selectedClassesWithSessions).toEqual(
        classesWithSessions
      );
    });
  });

  describe("reset", () => {
    it("should reset to initial state", () => {
      // Given: Set some values
      manager.setCurrentStep("class-selection");
      manager.setSelectedMonth(202412);
      manager.setSelectedClassIds([1, 2, 3]);
      manager.setSelectedAcademyId(1);

      // When
      manager.reset();

      // Then
      const state = manager.getState();
      expect(state.currentStep).toBe("main");
      expect(state.selectedMonth).toBeNull();
      expect(state.selectedClasses).toEqual([]);
      expect(state.selectedSessions).toEqual([]);
      expect(state.selectedClassIds).toEqual([]);
      expect(state.selectedAcademyId).toBeNull();
      expect(state.selectedClassesWithSessions).toEqual([]);
    });

    it("should notify listeners on reset", () => {
      // Given
      const listener = jest.fn();
      manager.subscribe(listener);
      manager.setCurrentStep("academy-selection");

      // When
      manager.reset();

      // Then
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: "main",
        })
      );
    });
  });

  describe("subscription", () => {
    it("should notify listeners on state change", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = manager.subscribe(listener);

      // When
      manager.setCurrentStep("academy-selection");

      // Then
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: "academy-selection",
        })
      );

      // Cleanup
      unsubscribe();
    });

    it("should allow unsubscribing", () => {
      // Given
      const listener = jest.fn();
      const unsubscribe = manager.subscribe(listener);
      unsubscribe();

      // When
      manager.setCurrentStep("academy-selection");

      // Then
      expect(listener).not.toHaveBeenCalled();
    });

    it("should handle multiple listeners", () => {
      // Given
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const unsubscribe1 = manager.subscribe(listener1);
      const unsubscribe2 = manager.subscribe(listener2);

      // When
      manager.setCurrentStep("academy-selection");

      // Then
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      // Cleanup
      unsubscribe1();
      unsubscribe2();
    });
  });

  describe("getInitialState", () => {
    it("should return correct initial state", () => {
      // Given: Set some values first
      manager.setCurrentStep("academy-selection");
      manager.setSelectedMonth(202412);
      manager.setSelectedClassIds([1, 2, 3]);
      manager.setSelectedAcademyId(1);

      // When: Reset to initial state
      manager.reset();

      // Then: Should be back to initial state
      const initialState = manager.getState();
      expect(initialState).toEqual({
        currentStep: "main",
        selectedMonth: null,
        selectedClasses: [],
        selectedSessions: [],
        selectedClassIds: [],
        selectedAcademyId: null,
        selectedClassesWithSessions: [],
      });
    });
  });
});
