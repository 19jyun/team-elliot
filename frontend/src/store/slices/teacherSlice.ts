import { createSlice } from "@reduxjs/toolkit";
import type { TeacherState } from "@/types/store/teacher";
import type { TeacherSession } from "@/types/api/teacher";

const initialState: TeacherState = {
  data: {
    calendarSessions: [],
    calendarRange: null,
  },
  isLoading: false,
  error: null,
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    // 전체 데이터 설정
    setTeacherData: (state, action) => {
      state.data = action.payload;
    },

    // 로딩 상태 관리
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // === 캘린더 세션 관련 액션들 ===

    // 캘린더 세션 데이터 설정
    setCalendarSessions: (state, action) => {
      if (state.data) {
        state.data.calendarSessions = action.payload;
      }
    },

    // 캘린더 범위 설정
    setCalendarRange: (state, action) => {
      if (state.data) {
        state.data.calendarRange = action.payload;
      }
    },

    // 개별 캘린더 세션 추가
    addCalendarSession: (state, action) => {
      if (state.data) {
        state.data.calendarSessions.push(action.payload);
      }
    },

    // 개별 캘린더 세션 업데이트
    updateCalendarSession: (state, action) => {
      if (state.data?.calendarSessions) {
        const index = state.data.calendarSessions.findIndex(
          (s: TeacherSession) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.data.calendarSessions[index] = action.payload;
        }
      }
    },

    // 개별 캘린더 세션 제거
    removeCalendarSession: (state, action) => {
      if (state.data?.calendarSessions) {
        state.data.calendarSessions = state.data.calendarSessions.filter(
          (s: TeacherSession) => s.id !== action.payload
        );
      }
    },

    // 세션 정보 업데이트 (소켓용)
    updateSessionInfoFromSocket: (state, action) => {
      const { sessionId, updates } = action.payload;
      if (state.data?.calendarSessions) {
        const sessionIndex = state.data.calendarSessions.findIndex(
          (s: TeacherSession) => s.id === sessionId
        );
        if (sessionIndex !== -1) {
          state.data.calendarSessions[sessionIndex] = {
            ...state.data.calendarSessions[sessionIndex],
            ...updates,
          };
        }
      }
    },

    // 새로운 세션 추가 (소켓용)
    addNewSessionFromSocket: (state, action) => {
      const newSession = action.payload;
      if (state.data?.calendarSessions) {
        // 중복 체크
        const existingIndex = state.data.calendarSessions.findIndex(
          (s: TeacherSession) => s.id === newSession.id
        );
        if (existingIndex === -1) {
          state.data.calendarSessions.push(newSession);
        }
      }
    },

    // 데이터 초기화
    clearTeacherData: (state) => {
      state.data = {
        calendarSessions: [],
        calendarRange: null,
      };
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setTeacherData,
  setLoading,
  setError,
  clearError,
  setCalendarSessions,
  setCalendarRange,
  addCalendarSession,
  updateCalendarSession,
  removeCalendarSession,
  updateSessionInfoFromSocket,
  addNewSessionFromSocket,
  clearTeacherData,
} = teacherSlice.actions;

export default teacherSlice.reducer;
