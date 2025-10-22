import { createSlice } from "@reduxjs/toolkit";
import type { PrincipalState } from "@/types/store/principal";
import type { SocketEventData } from "@/types/socket";
import { RefundStatus } from "@/types/api/refund";
import type { PrincipalClassSession } from "@/types/api/principal";

const initialState: PrincipalState = {
  data: {
    enrollments: [],
    refundRequests: [],
    calendarSessions: [],
    calendarRange: null,
  },
  isLoading: false,
  error: null,
};

const principalSlice = createSlice({
  name: "principal",
  initialState,
  reducers: {
    // 실시간 업데이트가 필요한 데이터만 설정
    setPrincipalData: (state, action) => {
      state.data = action.payload;
    },

    // 수강신청 실시간 업데이트
    updatePrincipalEnrollment: (state, action) => {
      if (state.data?.enrollments && Array.isArray(state.data.enrollments)) {
        const index = state.data.enrollments.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.data.enrollments[index] = action.payload;
        } else {
          state.data.enrollments.push(action.payload);
        }
      }
    },

    // 환불요청 실시간 업데이트
    updatePrincipalRefundRequest: (state, action) => {
      if (
        state.data?.refundRequests &&
        Array.isArray(state.data.refundRequests)
      ) {
        const index = state.data.refundRequests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.data.refundRequests[index] = action.payload;
        } else {
          state.data.refundRequests.push(action.payload);
        }
      }
    },

    // Socket 이벤트 액션들 (실시간 업데이트)
    updatePrincipalEnrollmentFromSocket: (state, action) => {
      // 새로운 수강신청 요청 이벤트 처리
      const payload =
        action.payload as SocketEventData<"new_enrollment_request">;
      const { enrollmentId, studentId, sessionId, timestamp } = payload;

      // 새로운 수강신청 요청을 목록에 추가
      if (state.data?.enrollments && Array.isArray(state.data.enrollments)) {
        const newEnrollment = {
          id: enrollmentId,
          studentId,
          sessionId,
          status: RefundStatus.PENDING,
          enrolledAt: timestamp,
          session: {
            id: sessionId,
            date: "", // 기본값
            startTime: "", // 기본값
            endTime: "", // 기본값
            class: {
              id: 0, // 기본값
              className: "", // 기본값
              teacher: {
                name: "", // 기본값
              },
            },
          },
          student: {
            id: studentId,
            name: "", // 기본값
          },
        };

        // 중복 체크 후 추가
        const existingIndex = state.data.enrollments.findIndex(
          (e) => e.id === enrollmentId
        );
        if (existingIndex === -1) {
          state.data.enrollments.unshift(newEnrollment);
        }
      }
    },

    updatePrincipalRefundRequestFromSocket: (state, action) => {
      // 새로운 환불 요청 이벤트 처리
      const payload = action.payload as SocketEventData<"new_refund_request">;
      const { refundId, studentId, sessionId, timestamp } = payload;

      // 새로운 환불 요청을 목록에 추가
      if (
        state.data?.refundRequests &&
        Array.isArray(state.data.refundRequests)
      ) {
        const newRefundRequest = {
          id: refundId,
          sessionEnrollmentId: 0, // 기본값
          studentId,
          reason: "", // 기본값
          refundAmount: 0, // 기본값
          status: RefundStatus.PENDING,
          requestedAt: timestamp,
          sessionEnrollment: {
            session: {
              id: sessionId,
              date: "", // 기본값
              startTime: "", // 기본값
              endTime: "", // 기본값
              class: {
                id: 0, // 기본값
                className: "", // 기본값
                level: "BEGINNER", // 기본값
                teacher: {
                  name: "", // 기본값
                },
              },
            },
            date: "", // 기본값
            startTime: "", // 기본값
            endTime: "", // 기본값
          },
          student: {
            id: studentId,
            name: "", // 기본값
          },
        };

        // 중복 체크 후 추가
        const existingIndex = state.data.refundRequests.findIndex(
          (r) => r.id === refundId
        );
        if (existingIndex === -1) {
          state.data.refundRequests.unshift(newRefundRequest);
        }
      }
    },

    // UI 상태 관리
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
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
          (s: PrincipalClassSession) => s.id === action.payload.id
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
          (s: PrincipalClassSession) => s.id !== action.payload
        );
      }
    },

    // 세션 정보 업데이트 (소켓용)
    updateSessionInfoFromSocket: (state, action) => {
      const { sessionId, updates } = action.payload;
      if (state.data?.calendarSessions) {
        const sessionIndex = state.data.calendarSessions.findIndex(
          (s: PrincipalClassSession) => s.id === sessionId
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
          (s: PrincipalClassSession) => s.id === newSession.id
        );
        if (existingIndex === -1) {
          state.data.calendarSessions.push(newSession);
        }
      }
    },

    clearPrincipalData: (state) => {
      state.data = {
        enrollments: [],
        refundRequests: [],
        calendarSessions: [],
        calendarRange: null,
      };
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setPrincipalData,
  setLoading,
  setError,
  updatePrincipalEnrollment,
  updatePrincipalRefundRequest,
  setCalendarSessions,
  setCalendarRange,
  addCalendarSession,
  updateCalendarSession,
  removeCalendarSession,
  updateSessionInfoFromSocket,
  addNewSessionFromSocket,
  clearPrincipalData,
} = principalSlice.actions;

export default principalSlice.reducer;
