import { configureStore } from "@reduxjs/toolkit";
import { http, HttpResponse } from "msw";
import { server } from "@/__mocks__/server";
import type { User } from "@/types/store/common";
import type { PayloadAction } from "@reduxjs/toolkit";

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Mock Redux slice (실제 구현에 맞게 수정 필요)
const authSlice = {
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  } as AuthState,
  reducers: {
    loginStart: (state: AuthState) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    },
    loginSuccess: (state: AuthState, action: PayloadAction<User>) => {
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    },
    loginFailure: (state: AuthState, action: PayloadAction<string>) => {
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    },
    logout: (state: AuthState) => {
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    },
  },
};

// Mock store 생성
const createTestStore = (preloadedState: Partial<AuthState> = {}) => {
  return configureStore({
    reducer: {
      auth: (
        state = authSlice.initialState,
        action: { type: string; payload?: User | string }
      ) => {
        const reducer =
          authSlice.reducers[action.type as keyof typeof authSlice.reducers];
        if (reducer) {
          // 타입 단언을 사용하여 reducer 호출
          return (
            reducer as (
              state: AuthState,
              action: { type: string; payload?: User | string }
            ) => AuthState
          )(state, action);
        }
        return state;
      },
    },
    preloadedState: {
      auth: { ...authSlice.initialState, ...preloadedState },
    },
  });
};

describe("Auth Store Integration", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("Login Flow", () => {
    it("should handle successful login", async () => {
      const mockUser = {
        id: "1",
        userId: "testuser",
        name: "Test User",
        role: "STUDENT",
      };

      server.use(
        http.post("*/auth/login", () => {
          return HttpResponse.json({
            access_token: "mock-token",
            user: mockUser,
          });
        })
      );

      // 로그인 시작
      store.dispatch({ type: "loginStart" });
      expect(store.getState().auth.loading).toBe(true);

      // 로그인 성공
      store.dispatch({ type: "loginSuccess", payload: mockUser });
      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
    });

    it("should handle login failure", () => {
      const errorMessage = "Invalid credentials";

      // 로그인 시작
      store.dispatch({ type: "loginStart" });
      expect(store.getState().auth.loading).toBe(true);

      // 로그인 실패
      store.dispatch({ type: "loginFailure", payload: errorMessage });
      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("Logout Flow", () => {
    it("should handle logout", () => {
      // 먼저 로그인 상태로 설정
      const mockUser = {
        id: "1",
        userId: "testuser",
        name: "Test User",
        role: "STUDENT",
      };

      store.dispatch({ type: "loginSuccess", payload: mockUser });
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // 로그아웃
      store.dispatch({ type: "logout" });
      const state = store.getState().auth;

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe("State Persistence", () => {
    it("should maintain state across multiple actions", () => {
      const mockUser = {
        id: "1",
        userId: "testuser",
        name: "Test User",
        role: "STUDENT",
      };

      // 로그인
      store.dispatch({ type: "loginStart" });
      store.dispatch({ type: "loginSuccess", payload: mockUser });

      let state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);

      // 로그아웃
      store.dispatch({ type: "logout" });

      state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();

      // 다시 로그인
      store.dispatch({ type: "loginStart" });
      store.dispatch({ type: "loginSuccess", payload: mockUser });

      state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });
  });
});
