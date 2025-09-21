import { createSlice } from "@reduxjs/toolkit";
import type { StudentState } from "@/types/store/student";
import type {
  EnrollmentHistory,
  CancellationHistory,
} from "@/types/api/student";
import type { ClassSession } from "@/types/api/class";
import type { SocketEventData } from "@/types/socket";

const initialState: StudentState = {
  data: {
    enrollmentHistory: [],
    cancellationHistory: [],
    calendarSessions: [],
    calendarRange: null,
  },
  isLoading: false,
  error: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    // 1. 전체 데이터 설정
    setStudentData: (state, action) => {
      state.data = action.payload;
    },

    // 2. 로딩 상태 관리
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // 3. 수강 신청/결제 내역 업데이트
    updateStudentEnrollmentHistory: (state, action) => {
      if (state.data) {
        state.data.enrollmentHistory = action.payload;
      }
    },

    // 4. 환불/취소 내역 업데이트
    updateStudentCancellationHistory: (state, action) => {
      if (state.data) {
        state.data.cancellationHistory = action.payload;
      }
    },

    // 5. 캘린더 세션 데이터 설정
    setCalendarSessions: (state, action) => {
      if (state.data) {
        state.data.calendarSessions = action.payload;
      }
    },

    // 6. 캘린더 범위 설정
    setCalendarRange: (state, action) => {
      if (state.data) {
        state.data.calendarRange = action.payload;
      }
    },

    // 5. 개별 수강 신청 업데이트
    updateStudentEnrollment: (state, action) => {
      if (state.data?.enrollmentHistory) {
        const index = state.data.enrollmentHistory.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.data.enrollmentHistory[index] = action.payload;
        }
      }
    },

    // 6. 개별 환불/취소 업데이트
    updateStudentCancellation: (state, action) => {
      if (state.data?.cancellationHistory) {
        const index = state.data.cancellationHistory.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.data.cancellationHistory[index] = action.payload;
        }
      }
    },

    // 7. 개별 캘린더 세션 추가
    addCalendarSession: (state, action) => {
      if (state.data) {
        state.data.calendarSessions.push(action.payload);
      }
    },

    // 8. 개별 캘린더 세션 업데이트
    updateCalendarSession: (state, action) => {
      if (state.data?.calendarSessions) {
        const index = state.data.calendarSessions.findIndex(
          (s: ClassSession) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.data.calendarSessions[index] = action.payload;
        }
      }
    },

    // 9. 개별 캘린더 세션 제거
    removeCalendarSession: (state, action) => {
      if (state.data?.calendarSessions) {
        state.data.calendarSessions = state.data.calendarSessions.filter(
          (s: ClassSession) => s.id !== action.payload
        );
      }
    },

    // 7. 데이터 초기화
    clearStudentData: (state) => {
      state.data = {
        enrollmentHistory: [],
        cancellationHistory: [],
        calendarSessions: [],
        calendarRange: null,
      };
    },

    // === 낙관적 업데이트 관련 액션들 ===

    addOptimisticEnrollment: (state, action) => {
      if (state.data) {
        const optimisticEnrollment: EnrollmentHistory & {
          isOptimistic: boolean;
        } = {
          ...action.payload,
          isOptimistic: true,
        };
        state.data.enrollmentHistory.unshift(optimisticEnrollment);
      }
    },

    replaceOptimisticEnrollment: (state, action) => {
      if (state.data?.enrollmentHistory) {
        const { optimisticId, realEnrollment } = action.payload;

        // 기존 optimistic enrollment 제거
        const optimisticIndex = state.data.enrollmentHistory.findIndex(
          (e) => e.id === optimisticId
        );
        if (optimisticIndex !== -1) {
          state.data.enrollmentHistory.splice(optimisticIndex, 1);
        }

        // 동일한 id를 가진 기존 enrollment가 있는지 확인하고 제거
        const existingIndex = state.data.enrollmentHistory.findIndex(
          (e) => e.id === realEnrollment.id
        );
        if (existingIndex !== -1) {
          state.data.enrollmentHistory.splice(existingIndex, 1);
        }

        // 새로운 enrollment 추가
        state.data.enrollmentHistory.unshift({
          ...realEnrollment,
          isOptimistic: false,
        });
      }
    },

    removeOptimisticEnrollment: (state, action) => {
      if (state.data?.enrollmentHistory) {
        const optimisticId = action.payload;
        state.data.enrollmentHistory = state.data.enrollmentHistory.filter(
          (e) => e.id !== optimisticId
        );
      }
    },

    addOptimisticCancellation: (state, action) => {
      if (state.data) {
        const optimisticCancellation: CancellationHistory & {
          isOptimistic: boolean;
        } = {
          ...action.payload,
          isOptimistic: true,
        };
        state.data.cancellationHistory.unshift(optimisticCancellation);
      }
    },

    replaceOptimisticCancellation: (state, action) => {
      if (state.data?.cancellationHistory) {
        const { optimisticId, realCancellation } = action.payload;
        const index = state.data.cancellationHistory.findIndex(
          (c) => c.id === optimisticId
        );
        if (index !== -1) {
          state.data.cancellationHistory[index] = {
            ...realCancellation,
            isOptimistic: false,
          };
        }
      }
    },

    removeOptimisticCancellation: (state, action) => {
      if (state.data?.cancellationHistory) {
        const optimisticId = action.payload;
        state.data.cancellationHistory = state.data.cancellationHistory.filter(
          (c) => c.id !== optimisticId
        );
      }
    },

    // === 캘린더 세션 낙관적 업데이트 관련 액션들 ===

    addOptimisticCalendarSession: (state, action) => {
      if (state.data) {
        const optimisticSession = {
          ...action.payload,
          isOptimistic: true,
        };
        state.data.calendarSessions.push(optimisticSession);
      }
    },

    replaceOptimisticCalendarSession: (state, action) => {
      if (state.data?.calendarSessions) {
        const { optimisticId, realSession } = action.payload;

        // 기존 optimistic session 제거
        const optimisticIndex = state.data.calendarSessions.findIndex(
          (s: ClassSession) => s.id === optimisticId
        );
        if (optimisticIndex !== -1) {
          state.data.calendarSessions.splice(optimisticIndex, 1);
        }

        // 동일한 id를 가진 기존 session이 있는지 확인하고 제거
        const existingIndex = state.data.calendarSessions.findIndex(
          (s: ClassSession) => s.id === realSession.id
        );
        if (existingIndex !== -1) {
          state.data.calendarSessions.splice(existingIndex, 1);
        }

        // 새로운 session 추가
        state.data.calendarSessions.push({
          ...realSession,
          isOptimistic: false,
        });
      }
    },

    removeOptimisticCalendarSession: (state, action) => {
      if (state.data?.calendarSessions) {
        const optimisticId = action.payload;
        state.data.calendarSessions = state.data.calendarSessions.filter(
          (s: ClassSession) => s.id !== optimisticId
        );
      }
    },

    updateStudentEnrollmentFromSocket: (state, action) => {
      // 수강신청 승인/거절 이벤트 처리
      const payload = action.payload as SocketEventData<
        "enrollment_accepted" | "enrollment_rejected"
      >;
      const { enrollmentId, sessionId } = payload;
      if (state.data?.enrollmentHistory) {
        const index = state.data.enrollmentHistory.findIndex(
          (e) => e.id === enrollmentId
        );
        if (index !== -1) {
          // 이벤트 타입에 따라 상태 결정
          const newStatus = action.type.includes("accepted")
            ? "CONFIRMED"
            : "REJECTED";

          state.data.enrollmentHistory[index] = {
            ...state.data.enrollmentHistory[index],
            status: newStatus,
          };
        }
      }

      // 캘린더 세션 업데이트
      if (state.data?.calendarSessions && sessionId) {
        const sessionIndex = state.data.calendarSessions.findIndex(
          (s: ClassSession) => s.id === sessionId || s.classId === sessionId
        );

        if (sessionIndex !== -1) {
          // 이벤트 타입에 따라 캘린더 세션 상태 업데이트
          if (action.type.includes("accepted")) {
            // 승인된 경우
            state.data.calendarSessions[sessionIndex] = {
              ...state.data.calendarSessions[sessionIndex],
              isAlreadyEnrolled: true,
              studentEnrollmentStatus: "CONFIRMED",
            };
          } else if (action.type.includes("rejected")) {
            // 거절된 경우 캘린더에서 제거
            state.data.calendarSessions.splice(sessionIndex, 1);
          }
        }
      }
    },

    updateStudentCancellationFromSocket: (state, action) => {
      // 환불 승인/거절 이벤트 처리
      const payload = action.payload as SocketEventData<
        "refund_accepted" | "refund_rejected"
      >;
      const { refundId, sessionId } = payload;

      console.log("🔄 환불 요청 소켓 이벤트 수신:", { refundId, sessionId });

      if (state.data?.cancellationHistory) {
        const index = state.data.cancellationHistory.findIndex(
          (c) => c.id === refundId
        );
        if (index !== -1) {
          // 이벤트 타입에 따라 상태 결정
          const newStatus = action.type.includes("accepted")
            ? "APPROVED"
            : "REJECTED";

          state.data.cancellationHistory[index] = {
            ...state.data.cancellationHistory[index],
            status: newStatus,
          };
        }
      }

      // 캘린더 세션 업데이트 (환불 승인 시 세션 제거)
      if (
        action.type.includes("accepted") &&
        state.data?.calendarSessions &&
        sessionId
      ) {
        console.log("🔍 환불 승인 캘린더 세션 업데이트 시도:", {
          refundId,
          sessionId,
          totalSessions: state.data.calendarSessions.length,
        });

        const sessionIndex = state.data.calendarSessions.findIndex(
          (s: ClassSession) => s.id === sessionId || s.classId === sessionId
        );

        console.log("🎯 환불 세션 매칭 결과:", { sessionIndex, sessionId });

        if (sessionIndex !== -1) {
          console.log("✅ 환불 승인: 캘린더에서 세션 제거");
          // 환불이 승인된 경우 캘린더에서 세션 제거
          state.data.calendarSessions.splice(sessionIndex, 1);
        } else {
          console.warn("⚠️ 환불 승인: 매칭되는 세션을 찾을 수 없음:", {
            sessionId,
          });
        }
      }
    },

    // 17. 세션 정보 업데이트 (캘린더용)
    updateSessionInfoFromSocket: (state, action) => {
      const { sessionId, updates } = action.payload;
      if (state.data?.calendarSessions) {
        const sessionIndex = state.data.calendarSessions.findIndex(
          (s: ClassSession) => s.id === sessionId
        );
        if (sessionIndex !== -1) {
          state.data.calendarSessions[sessionIndex] = {
            ...state.data.calendarSessions[sessionIndex],
            ...updates,
          };
        }
      }
    },

    // 18. 새로운 세션 추가 (캘린더용)
    addNewSessionFromSocket: (state, action) => {
      const newSession = action.payload;
      if (state.data?.calendarSessions) {
        // 중복 체크
        const existingIndex = state.data.calendarSessions.findIndex(
          (s: ClassSession) => s.id === newSession.id
        );
        if (existingIndex === -1) {
          state.data.calendarSessions.push(newSession);
        }
      }
    },
  },
});

export const {
  setStudentData,
  setLoading,
  setError,
  clearError,
  updateStudentEnrollmentHistory,
  updateStudentCancellationHistory,
  clearStudentData,
  updateCalendarSession,
  removeCalendarSession,

  addOptimisticEnrollment,
  replaceOptimisticEnrollment,
  removeOptimisticEnrollment,
  addOptimisticCancellation,
  replaceOptimisticCancellation,
  removeOptimisticCancellation,
  addOptimisticCalendarSession,
  replaceOptimisticCalendarSession,
  removeOptimisticCalendarSession,
} = studentSlice.actions;

export default studentSlice.reducer;
