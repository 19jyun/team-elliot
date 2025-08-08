import { createSlice } from "@reduxjs/toolkit";
import type { TeacherState, TeacherData } from "@/types/store/teacher";
import type { SocketEventData } from "@/types/socket";

const initialState: TeacherState = {
  data: null,
  isLoading: false,
  error: null,
};

export const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    // 실시간 업데이트가 필요한 데이터만 설정
    setTeacherRealTimeData: (state, action) => {
      state.data = action.payload;
    },

    // 출석체크용 enrollment 실시간 업데이트
    updateTeacherEnrollment: (state, action) => {
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

    // Socket 이벤트 액션들 (실시간 업데이트)
    updateTeacherEnrollmentFromSocket: (state, action) => {
      const { enrollmentId, status, data } = action.payload;
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

    // UI 상태 관리
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearTeacherData: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setTeacherRealTimeData,
  setLoading,
  setError,
  updateTeacherEnrollment,
  updateTeacherEnrollmentFromSocket,
  clearTeacherData,
} = teacherSlice.actions;

export default teacherSlice.reducer;
