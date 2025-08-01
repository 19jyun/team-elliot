import { createSlice } from "@reduxjs/toolkit";
import type { PrincipalState, PrincipalData } from "@/types/store/principal";
import type { SocketEventData } from "@/types/socket";

const initialState: PrincipalState = {
  data: null,
  isLoading: false,
  error: null,
};

export const principalSlice = createSlice({
  name: "principal",
  initialState,
  reducers: {
    setPrincipalData: (state, action) => {
      state.data = action.payload;
    },

    updatePrincipalProfile: (state, action) => {
      if (state.data?.userProfile) {
        state.data.userProfile = {
          ...state.data.userProfile,
          ...action.payload,
        };
      }
    },

    updatePrincipalAcademy: (state, action) => {
      if (state.data?.academy) {
        state.data.academy = {
          ...state.data.academy,
          ...action.payload,
        };
      }
    },

    updatePrincipalEnrollment: (state, action) => {
      if (state.data?.enrollments) {
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

    updatePrincipalRefundRequest: (state, action) => {
      if (state.data?.refundRequests) {
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

    updatePrincipalClass: (state, action) => {
      if (state.data?.classes) {
        const index = state.data.classes.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.data.classes[index] = action.payload;
        } else {
          state.data.classes.push(action.payload);
        }
      }
    },

    updatePrincipalTeacher: (state, action) => {
      if (state.data?.teachers) {
        const index = state.data.teachers.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.data.teachers[index] = action.payload;
        } else {
          state.data.teachers.push(action.payload);
        }
      }
    },

    updatePrincipalStudent: (state, action) => {
      if (state.data?.students) {
        const index = state.data.students.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.data.students[index] = action.payload;
        } else {
          state.data.students.push(action.payload);
        }
      }
    },

    // Socket 이벤트 액션들 (Principal 전용)
    updatePrincipalEnrollmentFromSocket: (state, action) => {
      const { enrollmentId, status, data } =
        action.payload as SocketEventData<"enrollment_status_changed">;
      if (state.data?.enrollments) {
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
      if (state.data?.refundRequests) {
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

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearPrincipalData: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setPrincipalData,
  setLoading,
  setError,
  updatePrincipalProfile,
  updatePrincipalAcademy,
  updatePrincipalEnrollment,
  updatePrincipalRefundRequest,
  updatePrincipalClass,
  updatePrincipalTeacher,
  updatePrincipalStudent,
  updatePrincipalEnrollmentFromSocket,
  updatePrincipalRefundRequestFromSocket,
  clearPrincipalData,
} = principalSlice.actions;

export default principalSlice.reducer;
