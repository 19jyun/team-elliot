// src/contexts/navigation/__tests__/GoBackManager.test.ts
import { GoBackManager } from "../GoBackManager";
import { VirtualHistoryManager } from "../VirtualHistoryManager";
import { ContextEventBus } from "../../events/ContextEventBus";
import { GoBackContext } from "../../types/NavigationTypes";

describe("GoBackManager", () => {
  let goBackManager: GoBackManager;
  let virtualHistory: VirtualHistoryManager;
  let eventBus: ContextEventBus;

  beforeEach(() => {
    virtualHistory = new VirtualHistoryManager();
    eventBus = new ContextEventBus();
    goBackManager = new GoBackManager(virtualHistory, eventBus);
  });

  describe("executeGoBack", () => {
    it("should handle virtual history go back when available", async () => {
      // Given: 가상 히스토리에 이전 엔트리가 있는 상황
      virtualHistory.push({
        type: "navigation",
        data: { title: "Previous State", activeTab: 0 },
      });
      virtualHistory.push({
        type: "navigation",
        data: { title: "Current State", activeTab: 1 },
      });

      const context: GoBackContext = {
        subPage: null,
        activeTab: 1,
        formStates: {},
        history: [],
        currentHistoryIndex: 1,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 가상 히스토리에서 뒤로가기 성공
      expect(result.success).toBe(true);
      expect(result.action).toBe("history-back");
      expect(result.data?.entry).toBeDefined();
    });

    it("should handle enrollment subpage go back - step back", async () => {
      // Given: enrollment subpage에서 중간 단계
      const context: GoBackContext = {
        subPage: "enroll",
        activeTab: 1,
        formStates: {
          enrollment: { currentStep: "class-selection" },
        },
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 이전 단계로 이동
      expect(result.success).toBe(true);
      expect(result.action).toBe("step-back");
      expect(result.data?.formType).toBe("enrollment");
      expect(result.data?.step).toBe("academy-selection");
    });

    it("should handle enrollment subpage go back - close subpage", async () => {
      // Given: enrollment subpage에서 첫 번째 단계
      const context: GoBackContext = {
        subPage: "enroll",
        activeTab: 1,
        formStates: {
          enrollment: { currentStep: "academy-selection" },
        },
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: subpage 닫기
      expect(result.success).toBe(true);
      expect(result.action).toBe("close");
      expect(result.data?.subPage).toBe(null);
    });

    it("should handle create-class subpage go back", async () => {
      // Given: create-class subpage에서 중간 단계
      const context: GoBackContext = {
        subPage: "create-class",
        activeTab: 0,
        formStates: {
          createClass: { currentStep: "teacher" },
        },
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 이전 단계로 이동
      expect(result.success).toBe(true);
      expect(result.action).toBe("step-back");
      expect(result.data?.formType).toBe("createClass");
      expect(result.data?.step).toBe("info");
    });

    it("should handle auth subpage go back", async () => {
      // Given: auth subpage에서 중간 단계
      const context: GoBackContext = {
        subPage: "auth",
        activeTab: 0,
        formStates: {
          auth: { currentStep: "personal-info" },
        },
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 이전 단계로 이동
      expect(result.success).toBe(true);
      expect(result.action).toBe("step-back");
      expect(result.data?.formType).toBe("auth");
      expect(result.data?.step).toBe("role-selection");
    });

    it("should handle person-management subpage go back", async () => {
      // Given: person-management subpage에서 중간 단계
      const context: GoBackContext = {
        subPage: "person-management",
        activeTab: 1,
        formStates: {
          principalPersonManagement: { currentStep: "session-list" },
        },
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 이전 단계로 이동
      expect(result.success).toBe(true);
      expect(result.action).toBe("step-back");
      expect(result.data?.formType).toBe("principalPersonManagement");
      expect(result.data?.step).toBe("class-list");
    });

    it("should handle tab go back when no subpage", async () => {
      // Given: subpage가 없고 activeTab > 0인 상황
      const context: GoBackContext = {
        subPage: null,
        activeTab: 2,
        formStates: {},
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 이전 탭으로 이동
      expect(result.success).toBe(true);
      expect(result.action).toBe("navigate");
      expect(result.data?.activeTab).toBe(1);
    });

    it("should return none action when no go back available", async () => {
      // Given: 뒤로갈 수 없는 상황
      const context: GoBackContext = {
        subPage: null,
        activeTab: 0,
        formStates: {},
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 뒤로갈 수 없음
      expect(result.success).toBe(false);
      expect(result.action).toBe("none");
      expect(result.message).toBe("더 이상 뒤로갈 수 없습니다.");
    });

    it("should handle errors gracefully", async () => {
      // Given: 잘못된 context
      const context = null as unknown as GoBackContext;

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 에러 처리
      expect(result.success).toBe(false);
      expect(result.action).toBe("none");
      expect(result.message).toBe("Invalid context provided");
    });
  });

  describe("special handling", () => {
    it("should clear refund policy when going back from class-selection to academy-selection", async () => {
      // Given: class-selection에서 academy-selection으로 돌아가는 상황
      const context: GoBackContext = {
        subPage: "enroll",
        activeTab: 1,
        formStates: {
          enrollment: { currentStep: "class-selection" },
        },
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 환불 정책 초기화 플래그 설정
      expect(result.success).toBe(true);
      expect(result.data?.clearRefundPolicy).toBe(true);
    });

    it("should clear request selection when going back to session-list", async () => {
      // Given: request-detail에서 session-list로 돌아가는 상황
      const context: GoBackContext = {
        subPage: "person-management",
        activeTab: 1,
        formStates: {
          principalPersonManagement: { currentStep: "request-detail" },
        },
        history: [],
        currentHistoryIndex: 0,
      };

      // When: goBack 실행
      const result = await goBackManager.executeGoBack(context);

      // Then: 요청 선택 초기화 플래그 설정
      expect(result.success).toBe(true);
      expect(result.data?.clearRequestSelection).toBe(true);
    });
  });
});
