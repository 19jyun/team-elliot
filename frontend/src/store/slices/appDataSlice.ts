import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  User,
  PrincipalData,
  StudentData,
  TeacherData,
  AdminData,
} from "../types";
import {
  fetchUserData,
  fetchUserProfileData,
  fetchAcademyData,
  fetchEnrollmentsData,
  fetchRefundRequestsData,
  fetchClassesData,
  fetchTeachersData,
  fetchStudentsData,
  fetchAdminStudentsData,
  fetchAdminTeachersData,
  fetchAdminClassesData,
  fetchStudentClassesData,
  fetchStudentEnrollmentsData,
  fetchTeacherClassesData,
  fetchTeacherStudentsData,
} from "../api/appDataApi";
import type { SocketEventData } from "@/types/socket";

interface AppDataState {
  // 공통 데이터
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // 역할별 데이터
  principalData: PrincipalData | null;
  studentData: StudentData | null;
  teacherData: TeacherData | null;
  adminData: AdminData | null;
}

const initialState: AppDataState = {
  user: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  principalData: null,
  studentData: null,
  teacherData: null,
  adminData: null,
};

// 기본 액션들
export const appDataSlice = createSlice({
  name: "appData",
  initialState,
  reducers: {
    // 공통 액션들
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setLastUpdated: (state, action) => {
      state.lastUpdated = action.payload;
    },

    // Principal 관련 액션들
    setPrincipalData: (state, action) => {
      state.principalData = action.payload;
    },

    updatePrincipalProfile: (state, action) => {
      if (state.principalData?.userProfile) {
        state.principalData.userProfile = {
          ...state.principalData.userProfile,
          ...action.payload,
        };
      }
    },

    updatePrincipalAcademy: (state, action) => {
      if (state.principalData?.academy) {
        state.principalData.academy = {
          ...state.principalData.academy,
          ...action.payload,
        };
      }
    },

    updatePrincipalEnrollment: (state, action) => {
      if (state.principalData?.enrollments) {
        const index = state.principalData.enrollments.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.principalData.enrollments[index] = action.payload;
        } else {
          state.principalData.enrollments.push(action.payload);
        }
      }
    },

    updatePrincipalRefundRequest: (state, action) => {
      if (state.principalData?.refundRequests) {
        const index = state.principalData.refundRequests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.principalData.refundRequests[index] = action.payload;
        } else {
          state.principalData.refundRequests.push(action.payload);
        }
      }
    },

    updatePrincipalClass: (state, action) => {
      if (state.principalData?.classes) {
        const index = state.principalData.classes.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.principalData.classes[index] = action.payload;
        } else {
          state.principalData.classes.push(action.payload);
        }
      }
    },

    updatePrincipalTeacher: (state, action) => {
      if (state.principalData?.teachers) {
        const index = state.principalData.teachers.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.principalData.teachers[index] = action.payload;
        } else {
          state.principalData.teachers.push(action.payload);
        }
      }
    },

    updatePrincipalStudent: (state, action) => {
      if (state.principalData?.students) {
        const index = state.principalData.students.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.principalData.students[index] = action.payload;
        } else {
          state.principalData.students.push(action.payload);
        }
      }
    },

    // Socket 이벤트 액션들 (Principal 전용)
    updatePrincipalEnrollmentFromSocket: (state, action) => {
      const { enrollmentId, status, data } =
        action.payload as SocketEventData<"enrollment_status_changed">;
      if (state.principalData?.enrollments) {
        const index = state.principalData.enrollments.findIndex(
          (e) => e.id === enrollmentId
        );
        if (index !== -1) {
          state.principalData.enrollments[index] = {
            ...state.principalData.enrollments[index],
            status,
            ...data,
          };
        }
      }
    },

    updatePrincipalRefundRequestFromSocket: (state, action) => {
      const { refundId, status, data } =
        action.payload as SocketEventData<"refund_request_status_changed">;
      if (state.principalData?.refundRequests) {
        const index = state.principalData.refundRequests.findIndex(
          (r) => r.id === refundId
        );
        if (index !== -1) {
          state.principalData.refundRequests[index] = {
            ...state.principalData.refundRequests[index],
            status,
            ...data,
          };
        }
      }
    },

    // Student 관련 액션들 (추후 확장용)
    setStudentData: (state, action) => {
      state.studentData = action.payload;
    },

    // Teacher 관련 액션들 (추후 확장용)
    setTeacherData: (state, action) => {
      state.teacherData = action.payload;
    },

    // Admin 관련 액션들 (추후 확장용)
    setAdminData: (state, action) => {
      state.adminData = action.payload;
    },

    // 상태 초기화
    clearAppData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // 초기화 시작
      .addCase(initializeAppData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log("🔄 앱 데이터 초기화 시작...");
      })
      // 초기화 성공
      .addCase(initializeAppData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lastUpdated = new Date().toISOString();

        // 받은 데이터로 상태 업데이트
        if (action.payload.user) state.user = action.payload.user;
        if (action.payload.principalData)
          state.principalData = action.payload.principalData;
        if (action.payload.studentData)
          state.studentData = action.payload.studentData;
        if (action.payload.teacherData)
          state.teacherData = action.payload.teacherData;
        if (action.payload.adminData)
          state.adminData = action.payload.adminData;

        console.log("✅ 앱 데이터 초기화 완료");
      })
      // 초기화 실패
      .addCase(initializeAppData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.error("❌ 앱 데이터 초기화 실패:", action.payload);
      });
  },
});

// 앱 초기화 액션 (사용자 역할에 따라 필요한 데이터만 로딩)
export const initializeAppData = createAsyncThunk(
  "appData/initialize",
  async (
    { userId, userRole }: { userId: number; userRole: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("🚀 앱 초기 데이터 로딩 시작...", { userId, userRole });

      const startTime = Date.now();

      // 1. 사용자 정보 설정 (세션에서 가져온 정보 사용)
      const user: User = {
        id: userId,
        userId: `user_${userId}`,
        name: "사용자", // 실제로는 세션에서 가져와야 함
        email: "user@example.com", // 실제로는 세션에서 가져와야 함
        role: userRole as any,
      };

      let data: any = { user };

      // 2. 사용자 역할에 따라 필요한 데이터 로딩
      switch (userRole) {
        case "PRINCIPAL":
          const [
            academy,
            enrollments,
            refundRequests,
            classes,
            teachers,
            students,
            userProfile,
          ] = await Promise.all([
            fetchAcademyData(userId),
            fetchEnrollmentsData(userId),
            fetchRefundRequestsData(userId),
            fetchClassesData(userId),
            fetchTeachersData(userId),
            fetchStudentsData(userId),
            fetchUserProfileData(userId),
          ]);

          data = {
            ...data,
            principalData: {
              userProfile,
              academy,
              enrollments,
              refundRequests,
              classes,
              teachers,
              students,
            },
          };
          break;

        case "ADMIN":
          const [adminStudents, adminTeachers, adminClasses] =
            await Promise.all([
              fetchAdminStudentsData(),
              fetchAdminTeachersData(),
              fetchAdminClassesData(),
            ]);

          data = {
            ...data,
            adminData: {
              students: adminStudents,
              teachers: adminTeachers,
              classes: adminClasses,
            },
          };
          break;

        case "STUDENT":
          // 추후 Student 데이터 로딩 로직 구현 예정
          data = {
            ...data,
            studentData: {},
          };
          break;

        case "TEACHER":
          // 추후 Teacher 데이터 로딩 로직 구현 예정
          data = {
            ...data,
            teacherData: {},
          };
          break;
      }

      const endTime = Date.now();
      console.log(`✅ 앱 초기 데이터 로딩 완료 (${endTime - startTime}ms)`);

      return data;
    } catch (error: any) {
      console.error("❌ 앱 초기 데이터 로딩 실패:", error);
      return rejectWithValue(error.message || "데이터 로딩에 실패했습니다.");
    }
  }
);

export const {
  setUser,
  setLoading,
  setError,
  setLastUpdated,
  setPrincipalData,
  updatePrincipalProfile,
  updatePrincipalAcademy,
  updatePrincipalEnrollment,
  updatePrincipalRefundRequest,
  updatePrincipalClass,
  updatePrincipalTeacher,
  updatePrincipalStudent,
  updatePrincipalEnrollmentFromSocket,
  updatePrincipalRefundRequestFromSocket,
  setStudentData,
  setTeacherData,
  setAdminData,
  clearAppData,
} = appDataSlice.actions;

export default appDataSlice.reducer;
