import { createSlice } from "@reduxjs/toolkit";
import type { PrincipalState, PrincipalData } from "@/types/store/principal";
import type { SocketEventData } from "@/types/socket";

const initialState: PrincipalState = {
  data: {
    enrollments: [],
    refundRequests: [],
  },
  isLoading: false,
  error: null,
};

export const principalSlice = createSlice({
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
      const { enrollmentId, status, data } =
        action.payload as SocketEventData<"enrollment_status_changed">;
      if (state.data?.enrollments && Array.isArray(state.data.enrollments)) {
        const index = state.data.enrollments.findIndex(
          (e) => e.id === enrollmentId
        );
        if (index !== -1) {
          state.data.enrollments[index] = {
            ...state.data.enrollments[index],
            status,
            ...data,
          };
        }
      }
    },

    updatePrincipalRefundRequestFromSocket: (state, action) => {
      const { refundId, status, data } =
        action.payload as SocketEventData<"refund_request_status_changed">;
      if (
        state.data?.refundRequests &&
        Array.isArray(state.data.refundRequests)
      ) {
        const index = state.data.refundRequests.findIndex(
          (r) => r.id === refundId
        );
        if (index !== -1) {
          state.data.refundRequests[index] = {
            ...state.data.refundRequests[index],
            status,
            ...data,
          };
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

    clearPrincipalData: (state) => {
      state.data = {
        enrollments: [],
        refundRequests: [],
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
  updatePrincipalEnrollmentFromSocket,
  updatePrincipalRefundRequestFromSocket,
  clearPrincipalData,
} = principalSlice.actions;

export default principalSlice.reducer;
