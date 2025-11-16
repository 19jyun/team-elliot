import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * 인증 상태 관리 Slice
 *
 * 글로벌 비즈니스 상태로 관리되는 인증 정보:
 * - 인증 토큰 (서버 상태가 아닌 클라이언트에서 관리하는 토큰)
 * - 사용자 역할 (서버에서 가져오지만 글로벌 비즈니스 로직에 사용)
 * - 인증 상태
 */

interface AuthState {
  // 인증 토큰 (서버 상태가 아닌 클라이언트에서 관리하는 토큰)
  accessToken: string | null;
  refreshToken: string | null;

  // 사용자 역할 (서버에서 가져오지만 글로벌 비즈니스 로직에 사용)
  userRole: "STUDENT" | "TEACHER" | "PRINCIPAL" | null;
  userId: string | null;

  // 인증 상태
  isAuthenticated: boolean;

  // 토큰 만료 시간
  expiresAt: number | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userRole: null,
  userId: null,
  isAuthenticated: false,
  expiresAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 로그인 성공 시
    setAuth: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
        userRole: "STUDENT" | "TEACHER" | "PRINCIPAL";
        userId: string;
        expiresAt: number;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      state.userRole = action.payload.userRole;
      state.userId = action.payload.userId;
      state.isAuthenticated = true;
      state.expiresAt = action.payload.expiresAt;
    },

    // 토큰 갱신
    updateToken: (
      state,
      action: PayloadAction<{
        accessToken: string;
        expiresAt: number;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.expiresAt = action.payload.expiresAt;
    },

    // 로그아웃
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userRole = null;
      state.userId = null;
      state.isAuthenticated = false;
      state.expiresAt = null;
    },

    // 역할 업데이트 (서버에서 변경된 경우)
    updateUserRole: (
      state,
      action: PayloadAction<"STUDENT" | "TEACHER" | "PRINCIPAL">
    ) => {
      state.userRole = action.payload;
    },
  },
});

export const { setAuth, updateToken, clearAuth, updateUserRole } =
  authSlice.actions;
export default authSlice.reducer;
