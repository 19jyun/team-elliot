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
    setTeacherData: (state, action) => {
      state.data = action.payload;
    },

    updateTeacherProfile: (state, action) => {
      if (state.data?.userProfile) {
        state.data.userProfile = {
          ...state.data.userProfile,
          ...action.payload,
        };
      }
    },

    updateTeacherAcademy: (state, action) => {
      if (state.data) {
        state.data.academy = action.payload;
      }
    },

    // Academy Management 관련 액션들
    setCurrentAcademy: (state, action) => {
      if (state.data) {
        state.data.academy = action.payload;
      }
    },

    clearCurrentAcademy: (state) => {
      if (state.data) {
        state.data.academy = null;
      }
    },

    setAcademyLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setAcademyError: (state, action) => {
      state.error = action.payload;
    },

    updateTeacherPrincipal: (state, action) => {
      if (state.data) {
        state.data.principal = action.payload;
      }
    },

    updateTeacherClass: (state, action) => {
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

    updateTeacherSession: (state, action) => {
      if (state.data?.sessions) {
        const index = state.data.sessions.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.data.sessions[index] = action.payload;
        } else {
          state.data.sessions.push(action.payload);
        }
      }
    },

    updateTeacherEnrollment: (state, action) => {
      if (state.data?.classes) {
        // 클래스의 세션에서 해당 수강신청 업데이트
        state.data.classes.forEach((cls) => {
          cls.classSessions.forEach((session) => {
            const enrollmentIndex = session.enrollments.findIndex(
              (e: any) => e.id === action.payload.id
            );
            if (enrollmentIndex !== -1) {
              session.enrollments[enrollmentIndex] = action.payload;
            }
          });
        });
      }
    },

    // Socket 이벤트 액션들 (Teacher 전용)
    updateTeacherEnrollmentFromSocket: (state, action) => {
      const { enrollmentId, status, data } = action.payload;
      if (state.data?.classes) {
        state.data.classes.forEach((cls) => {
          cls.classSessions.forEach((session) => {
            const enrollmentIndex = session.enrollments.findIndex(
              (e: any) => e.id === enrollmentId
            );
            if (enrollmentIndex !== -1) {
              session.enrollments[enrollmentIndex] = {
                ...session.enrollments[enrollmentIndex],
                status,
                ...data,
              };
            }
          });
        });
      }
    },

    updateTeacherSessionFromSocket: (state, action) => {
      const { sessionId, data } = action.payload;
      if (state.data?.classes) {
        state.data.classes.forEach((cls) => {
          const sessionIndex = cls.classSessions.findIndex(
            (s) => s.id === sessionId
          );
          if (sessionIndex !== -1) {
            cls.classSessions[sessionIndex] = {
              ...cls.classSessions[sessionIndex],
              ...data,
            };
          }
        });
      }
    },

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
  setTeacherData,
  setLoading,
  setError,
  updateTeacherProfile,
  updateTeacherAcademy,
  updateTeacherPrincipal,
  updateTeacherClass,
  updateTeacherSession,
  updateTeacherEnrollment,
  updateTeacherEnrollmentFromSocket,
  updateTeacherSessionFromSocket,
  clearTeacherData,
  // Academy Management 액션들
  setCurrentAcademy,
  clearCurrentAcademy,
  setAcademyLoading,
  setAcademyError,
} = teacherSlice.actions;

export default teacherSlice.reducer;
