// src/contexts/__tests__/ImprovedGoBackManager.test.ts
import { GoBackManager } from "../navigation/GoBackManager";
import { VirtualHistoryManager } from "../navigation/VirtualHistoryManager";
import { ContextEventBus } from "../events/ContextEventBus";
import {
  StateSyncContextType,
  NavigationState,
  FormsState,
} from "../state/StateSyncTypes";

// Mock StateSync
const mockStateSync: StateSyncContextType = {
  publish: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
  getState: jest.fn(),
  syncStates: jest.fn(),
  clearState: jest.fn(),
  clearAllStates: jest.fn(),
};

// Mock ContextEventBus
const mockEventBus = new ContextEventBus();

describe("ImprovedGoBackManager", () => {
  let goBackManager: GoBackManager;
  let virtualHistory: VirtualHistoryManager;

  beforeEach(() => {
    virtualHistory = new VirtualHistoryManager();
    goBackManager = new GoBackManager(
      virtualHistory,
      mockEventBus,
      mockStateSync
    );
    jest.clearAllMocks();
  });

  describe("executeGoBack", () => {
    it("should return fallback when state is not available", async () => {
      (mockStateSync.getState as jest.Mock).mockReturnValue(null);

      const result = await goBackManager.executeGoBack();

      expect(result.success).toBe(false);
      expect(result.action).toBe("none");
      expect(result.message).toBe("더 이상 뒤로갈 수 없습니다.");
    });

    it("should return fallback when navigation state has subPage", async () => {
      (mockStateSync.getState as jest.Mock).mockImplementation((key) => {
        if (key === "navigation") {
          return { subPage: "test" };
        }
        return null;
      });

      const result = await goBackManager.executeGoBack();

      expect(result.success).toBe(true);
      expect(result.action).toBe("close");
      expect(result.data).toEqual({ subPage: null });
    });
  });

  describe("executeGoBackWithState", () => {
    const mockNavigationState: NavigationState = {
      activeTab: 0,
      subPage: "enroll",
      canGoBack: false,
      isTransitioning: false,
      navigationItems: [],
      history: [],
    };

    const mockFormsState: FormsState = {
      enrollment: {
        currentStep: "academy-selection",
        selectedMonth: null,
        selectedClasses: [],
        selectedSessions: [],
        selectedClassIds: [],
        selectedAcademyId: null,
        selectedClassesWithSessions: [],
      },
      createClass: {
        currentStep: "info",
        classFormData: {
          name: "",
          description: "",
          level: "BEGINNER" as const,
          maxStudents: 0,
          price: 0,
          content: "",
          schedule: {
            days: [],
            startTime: "",
            endTime: "",
            startDate: "",
            endDate: "",
          },
        },
        selectedTeacherId: null,
      },
      auth: {
        authMode: "login",
        authSubPage: null,
        signup: {
          step: "role-selection",
          role: "STUDENT",
          personalInfo: {
            name: "",
            phoneNumber: "",
          },
          accountInfo: {
            userId: "",
            password: "",
            confirmPassword: "",
          },
          terms: {
            age: false,
            terms1: false,
            terms2: false,
            marketing: false,
          },
        },
        login: {
          userId: "",
          password: "",
        },
      },
      personManagement: {
        currentStep: "class-list",
        selectedTab: "enrollment",
        selectedClassId: null,
        selectedSessionId: null,
        selectedRequestId: null,
        selectedRequestType: null,
      },
      principalCreateClass: {
        currentStep: "info",
        classFormData: {
          name: "",
          description: "",
          maxStudents: 0,
          price: 0,
          startDate: "",
          endDate: "",
          schedule: [],
        },
        selectedTeacherId: null,
      },
      principalPersonManagement: {
        currentStep: "class-list",
        selectedTab: "enrollment",
        selectedClassId: null,
        selectedSessionId: null,
        selectedRequestId: null,
        selectedRequestType: null,
      },
    };

    it("should handle subPage goBack for enrollment", async () => {
      const result = await goBackManager.executeGoBackWithState(
        mockNavigationState,
        mockFormsState
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe("close");
      expect(result.data).toEqual({ subPage: null });
    });

    it("should handle subPage goBack for academy", async () => {
      const academyNavigationState = {
        ...mockNavigationState,
        subPage: "academy",
      };

      const result = await goBackManager.executeGoBackWithState(
        academyNavigationState,
        mockFormsState
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe("close");
      expect(result.data).toEqual({ subPage: null });
    });

    it("should handle subPage goBack for modify", async () => {
      const modifyNavigationState = {
        ...mockNavigationState,
        subPage: "modify",
      };

      const modifyFormsState: FormsState = {
        ...mockFormsState,
        enrollment: {
          ...mockFormsState.enrollment,
          currentStep: "date-selection",
        },
      };

      const result = await goBackManager.executeGoBackWithState(
        modifyNavigationState,
        modifyFormsState
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe("close");
      expect(result.data?.subPage).toBe(null);
    });

    it("should handle virtual history goBack when no subPage", async () => {
      const noSubPageNavigationState = {
        ...mockNavigationState,
        subPage: null,
      };

      // Add some history entries to make canGoBack() return true
      virtualHistory.push({
        type: "navigation",
        data: { title: "First Page" },
      });
      virtualHistory.push({
        type: "navigation",
        data: { title: "Second Page" },
      });

      const result = await goBackManager.executeGoBackWithState(
        noSubPageNavigationState,
        mockFormsState
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe("navigate");
    });

    it("should handle tab goBack when no subPage and no history", async () => {
      const tabNavigationState = {
        ...mockNavigationState,
        subPage: null,
        activeTab: 1,
      };

      const result = await goBackManager.executeGoBackWithState(
        tabNavigationState,
        mockFormsState
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe("navigate");
      expect(result.data?.activeTab).toBe(0);
    });

    it("should return no action when nothing to go back to", async () => {
      const noGoBackNavigationState = {
        ...mockNavigationState,
        subPage: null,
        activeTab: 0,
      };

      const result = await goBackManager.executeGoBackWithState(
        noGoBackNavigationState,
        mockFormsState
      );

      expect(result.success).toBe(false);
      expect(result.action).toBe("none");
      expect(result.message).toBe("더 이상 뒤로갈 수 없습니다.");
    });
  });

  describe("enrollment goBack", () => {
    it("should go back to previous step in enrollment", async () => {
      const navigationState: NavigationState = {
        activeTab: 0,
        subPage: "enroll",
        canGoBack: false,
        isTransitioning: false,
        navigationItems: [],
        history: [],
      };

      const formsState: FormsState = {
        enrollment: {
          currentStep: "class-selection",
          selectedMonth: null,
          selectedClasses: [],
          selectedSessions: [],
          selectedClassIds: [],
          selectedAcademyId: null,
          selectedClassesWithSessions: [],
        },
        createClass: {
          currentStep: "info",
          classFormData: {
            name: "",
            description: "",
            level: "BEGINNER" as const,
            maxStudents: 0,
            price: 0,
            content: "",
            schedule: {
              days: [],
              startTime: "",
              endTime: "",
              startDate: "",
              endDate: "",
            },
          },
          selectedTeacherId: null,
        },
        auth: {
          authMode: "login",
          authSubPage: null,
          signup: {
            step: "role-selection",
            role: "STUDENT",
            personalInfo: {
              name: "",
              phoneNumber: "",
            },
            accountInfo: {
              userId: "",
              password: "",
              confirmPassword: "",
            },
            terms: {
              age: false,
              terms1: false,
              terms2: false,
              marketing: false,
            },
          },
          login: {
            userId: "",
            password: "",
          },
        },
        personManagement: {
          currentStep: "class-list",
          selectedTab: "enrollment",
          selectedClassId: null,
          selectedSessionId: null,
          selectedRequestId: null,
          selectedRequestType: null,
        },
        principalCreateClass: {
          currentStep: "info",
          classFormData: {
            name: "",
            description: "",
            maxStudents: 0,
            price: 0,
            startDate: "",
            endDate: "",
            schedule: [],
          },
          selectedTeacherId: null,
        },
        principalPersonManagement: {
          currentStep: "class-list",
          selectedTab: "enrollment",
          selectedClassId: null,
          selectedSessionId: null,
          selectedRequestId: null,
          selectedRequestType: null,
        },
      };

      const result = await goBackManager.executeGoBackWithState(
        navigationState,
        formsState
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe("close");
      expect(result.data?.subPage).toBe(null);
    });

    it("should close subPage when at first step", async () => {
      const navigationState: NavigationState = {
        activeTab: 0,
        subPage: "enroll",
        canGoBack: false,
        isTransitioning: false,
        navigationItems: [],
        history: [],
      };

      const formsState: FormsState = {
        enrollment: {
          currentStep: "academy-selection",
          selectedMonth: null,
          selectedClasses: [],
          selectedSessions: [],
          selectedClassIds: [],
          selectedAcademyId: null,
          selectedClassesWithSessions: [],
        },
        createClass: {
          currentStep: "info",
          classFormData: {
            name: "",
            description: "",
            level: "BEGINNER" as const,
            maxStudents: 0,
            price: 0,
            content: "",
            schedule: {
              days: [],
              startTime: "",
              endTime: "",
              startDate: "",
              endDate: "",
            },
          },
          selectedTeacherId: null,
        },
        auth: {
          authMode: "login",
          authSubPage: null,
          signup: {
            step: "role-selection",
            role: "STUDENT",
            personalInfo: {
              name: "",
              phoneNumber: "",
            },
            accountInfo: {
              userId: "",
              password: "",
              confirmPassword: "",
            },
            terms: {
              age: false,
              terms1: false,
              terms2: false,
              marketing: false,
            },
          },
          login: {
            userId: "",
            password: "",
          },
        },
        personManagement: {
          currentStep: "class-list",
          selectedTab: "enrollment",
          selectedClassId: null,
          selectedSessionId: null,
          selectedRequestId: null,
          selectedRequestType: null,
        },
        principalCreateClass: {
          currentStep: "info",
          classFormData: {
            name: "",
            description: "",
            maxStudents: 0,
            price: 0,
            startDate: "",
            endDate: "",
            schedule: [],
          },
          selectedTeacherId: null,
        },
        principalPersonManagement: {
          currentStep: "class-list",
          selectedTab: "enrollment",
          selectedClassId: null,
          selectedSessionId: null,
          selectedRequestId: null,
          selectedRequestType: null,
        },
      };

      const result = await goBackManager.executeGoBackWithState(
        navigationState,
        formsState
      );

      expect(result.success).toBe(true);
      expect(result.action).toBe("close");
      expect(result.data).toEqual({ subPage: null });
    });
  });

  describe("error handling", () => {
    it("should handle errors gracefully", async () => {
      const mockError = new Error("Test error");
      jest.spyOn(console, "error").mockImplementation();

      // Mock stateSync.getState to throw an error
      (mockStateSync.getState as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      const result = await goBackManager.executeGoBack();

      expect(result.success).toBe(false);
      expect(result.action).toBe("none");
      expect(result.message).toContain("Test error");

      jest.restoreAllMocks();
    });
  });
});
