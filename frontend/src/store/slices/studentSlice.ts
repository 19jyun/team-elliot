import { createSlice } from "@reduxjs/toolkit";
import type { StudentState, StudentData } from "@/types/store/student";
import type { SocketEventData } from "@/types/socket";

const initialState: StudentState = {
  data: null,
  isLoading: false,
  error: null,
};

export const studentSlice = createSlice({
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

    // 3. 개별 데이터 업데이트
    updateStudentProfile: (state, action) => {
      if (state.data?.userProfile) {
        state.data.userProfile = {
          ...state.data.userProfile,
          ...action.payload,
        };
      }
    },

    updateStudentAcademies: (state, action) => {
      if (state.data) {
        state.data.academies = action.payload;
      }
    },

    updateStudentClasses: (state, action) => {
      if (state.data) {
        state.data.enrollmentClasses = action.payload.enrollmentClasses;
        state.data.sessionClasses = action.payload.sessionClasses;
        state.data.calendarRange = action.payload.calendarRange;
      }
    },

    updateStudentEnrollmentHistory: (state, action) => {
      if (state.data) {
        state.data.enrollmentHistory = action.payload;
      }
    },

    updateStudentCancellationHistory: (state, action) => {
      if (state.data) {
        state.data.cancellationHistory = action.payload;
      }
    },

    // 4. 수강 가능한 클래스/세션 관련 액션들
    updateAvailableClasses: (state, action) => {
      if (state.data) {
        state.data.availableClasses = action.payload;
      }
    },

    updateAvailableSessions: (state, action) => {
      if (state.data) {
        state.data.availableSessions = action.payload;
      }
    },

    updateClassSessions: (state, action) => {
      const { classId, sessions } = action.payload;
      if (state.data?.availableClasses) {
        const classIndex = state.data.availableClasses.findIndex(
          (c) => c.id === classId
        );
        if (classIndex !== -1) {
          state.data.availableClasses[classIndex].availableSessions = sessions;
        }
      }
    },

    // 5. 수강신청 진행 상태 관리
    updateEnrollmentProgress: (state, action) => {
      if (state.data) {
        state.data.enrollmentProgress = {
          ...state.data.enrollmentProgress,
          ...action.payload,
        };
      }
    },

    clearEnrollmentProgress: (state) => {
      if (state.data?.enrollmentProgress) {
        state.data.enrollmentProgress = {
          currentStep: "academy-selection",
        };
      }
    },

    toggleSessionSelection: (state, action) => {
      const { sessionId } = action.payload;
      if (state.data?.enrollmentProgress?.selectedSessionIds) {
        const sessionIds = state.data.enrollmentProgress.selectedSessionIds;
        const index = sessionIds.indexOf(sessionId);

        if (index === -1) {
          sessionIds.push(sessionId);
        } else {
          sessionIds.splice(index, 1);
        }
      }
    },

    // 6. 개별 항목 추가/수정
    addStudentEnrollment: (state, action) => {
      if (state.data?.enrollmentHistory) {
        state.data.enrollmentHistory.push(action.payload);
      }
    },

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

    addStudentCancellation: (state, action) => {
      if (state.data?.cancellationHistory) {
        state.data.cancellationHistory.push(action.payload);
      }
    },

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

    // 7. 데이터 초기화
    clearStudentData: (state) => {
      state.data = null;
    },

    // 8. WebSocket 이벤트 액션들
    updateStudentEnrollmentFromSocket: (state, action) => {
      const { enrollmentId, status, data } =
        action.payload as SocketEventData<"enrollment_status_changed">;
      if (state.data?.enrollmentHistory) {
        const index = state.data.enrollmentHistory.findIndex(
          (e) => e.id === enrollmentId
        );
        if (index !== -1) {
          state.data.enrollmentHistory[index] = {
            ...state.data.enrollmentHistory[index],
            status,
            ...data,
          };
        }
      }
    },

    updateStudentCancellationFromSocket: (state, action) => {
      const { refundId, status, data } =
        action.payload as SocketEventData<"refund_request_status_changed">;
      if (state.data?.cancellationHistory) {
        const index = state.data.cancellationHistory.findIndex(
          (c) => c.id === refundId
        );
        if (index !== -1) {
          state.data.cancellationHistory[index] = {
            ...state.data.cancellationHistory[index],
            status,
            ...data,
          };
        }
      }
    },

    updateAvailableSessionFromSocket: (state, action) => {
      const { sessionId, data } =
        action.payload as SocketEventData<"session_availability_changed">;

      // availableSessions 업데이트
      if (state.data?.availableSessions) {
        const index = state.data.availableSessions.findIndex(
          (s) => s.id === sessionId
        );
        if (index !== -1) {
          state.data.availableSessions[index] = {
            ...state.data.availableSessions[index],
            ...data,
          };
        }
      }

      // availableClasses 내의 세션들도 업데이트
      if (state.data?.availableClasses) {
        state.data.availableClasses.forEach((cls) => {
          if (cls.availableSessions) {
            const sessionIndex = cls.availableSessions.findIndex(
              (s) => s.id === sessionId
            );
            if (sessionIndex !== -1) {
              cls.availableSessions[sessionIndex] = {
                ...cls.availableSessions[sessionIndex],
                ...data,
              };
            }
          }
        });
      }
    },

    updateAvailableClassFromSocket: (state, action) => {
      const { classId, data } =
        action.payload as SocketEventData<"class_availability_changed">;
      if (state.data?.availableClasses) {
        const index = state.data.availableClasses.findIndex(
          (c) => c.id === classId
        );
        if (index !== -1) {
          state.data.availableClasses[index] = {
            ...state.data.availableClasses[index],
            ...data,
          };
        }
      }
    },
  },
});

export const {
  setStudentData,
  setLoading,
  setError,
  updateStudentProfile,
  updateStudentAcademies,
  updateStudentClasses,
  updateStudentEnrollmentHistory,
  updateStudentCancellationHistory,
  updateAvailableClasses,
  updateAvailableSessions,
  updateClassSessions,
  updateEnrollmentProgress,
  clearEnrollmentProgress,
  toggleSessionSelection,
  addStudentEnrollment,
  updateStudentEnrollment,
  addStudentCancellation,
  updateStudentCancellation,
  clearStudentData,
  updateStudentEnrollmentFromSocket,
  updateStudentCancellationFromSocket,
  updateAvailableSessionFromSocket,
  updateAvailableClassFromSocket,
} = studentSlice.actions;

export default studentSlice.reducer;
