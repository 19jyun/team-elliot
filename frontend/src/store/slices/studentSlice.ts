import { createSlice } from "@reduxjs/toolkit";
import type { StudentState, StudentData } from "@/types/store/student";
import type { SocketEventData } from "@/types/socket";

const initialState: StudentState = {
  data: {
    enrollmentHistory: [],
    cancellationHistory: [],
  },
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

    // 7. 데이터 초기화
    clearStudentData: (state) => {
      state.data = {
        enrollmentHistory: [],
        cancellationHistory: [],
      };
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
  },
});

export const {
  setStudentData,
  setLoading,
  setError,
  updateStudentEnrollmentHistory,
  updateStudentCancellationHistory,
  updateStudentEnrollment,
  updateStudentCancellation,
  clearStudentData,
  updateStudentEnrollmentFromSocket,
  updateStudentCancellationFromSocket,
} = studentSlice.actions;

export default studentSlice.reducer;
