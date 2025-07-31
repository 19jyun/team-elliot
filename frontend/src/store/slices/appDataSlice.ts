import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  User,
  Academy,
  Class,
  SessionEnrollment,
  RefundRequest,
  Teacher,
  Student,
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
  // 사용자 정보
  user: User | null;
  userProfile: any | null; // 사용자 프로필 정보

  // 학원 정보
  academy: Academy | null;

  // 수강신청 관련
  enrollments: SessionEnrollment[];
  refundRequests: RefundRequest[];

  // 클래스 관련
  classes: Class[];

  // 사용자 관리
  teachers: Teacher[];
  students: Student[];

  // 로딩 상태
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: AppDataState = {
  user: null,
  userProfile: null,
  academy: null,
  enrollments: [],
  refundRequests: [],
  classes: [],
  teachers: [],
  students: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// 기본 액션들
export const appDataSlice = createSlice({
  name: "appData",
  initialState,
  reducers: {
    // 사용자 정보 설정
    setUser: (state, action) => {
      state.user = action.payload;
    },

    // 사용자 프로필 정보 설정
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },

    // 사용자 프로필 정보 업데이트 (실시간용)
    updateUserProfile: (state, action) => {
      if (state.userProfile) {
        state.userProfile = { ...state.userProfile, ...action.payload };
      }
    },

    // 학원 정보 설정
    setAcademy: (state, action) => {
      state.academy = action.payload;
    },

    // 학원 정보 업데이트 (실시간용)
    updateAcademy: (state, action) => {
      if (state.academy) {
        state.academy = { ...state.academy, ...action.payload };
      }
    },

    // 수강신청 업데이트 (실시간용)
    updateEnrollment: (state, action) => {
      const index = state.enrollments.findIndex(
        (e) => e.id === action.payload.id
      );
      if (index !== -1) {
        state.enrollments[index] = action.payload;
      } else {
        state.enrollments.push(action.payload);
      }
    },

    // Socket 이벤트로 수강신청 상태 변경
    updateEnrollmentFromSocket: (state, action) => {
      const { enrollmentId, status, data } =
        action.payload as SocketEventData<"enrollment_status_changed">;
      const index = state.enrollments.findIndex((e) => e.id === enrollmentId);
      if (index !== -1) {
        state.enrollments[index] = {
          ...state.enrollments[index],
          status,
          ...data,
        };
      }
    },

    // 환불 요청 업데이트 (실시간용)
    updateRefundRequest: (state, action) => {
      const index = state.refundRequests.findIndex(
        (r) => r.id === action.payload.id
      );
      if (index !== -1) {
        state.refundRequests[index] = action.payload;
      } else {
        state.refundRequests.push(action.payload);
      }
    },

    // Socket 이벤트로 환불 요청 상태 변경
    updateRefundRequestFromSocket: (state, action) => {
      const { refundId, status, data } =
        action.payload as SocketEventData<"refund_request_status_changed">;
      const index = state.refundRequests.findIndex((r) => r.id === refundId);
      if (index !== -1) {
        state.refundRequests[index] = {
          ...state.refundRequests[index],
          status,
          ...data,
        };
      }
    },

    // 클래스 업데이트 (실시간용)
    updateClass: (state, action) => {
      const index = state.classes.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.classes[index] = action.payload;
      } else {
        state.classes.push(action.payload);
      }
    },

    // 선생님 업데이트
    updateTeacher: (state, action) => {
      const index = state.teachers.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.teachers[index] = action.payload;
      } else {
        state.teachers.push(action.payload);
      }
    },

    // 학생 업데이트
    updateStudent: (state, action) => {
      const index = state.students.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
      } else {
        state.students.push(action.payload);
      }
    },

    // 로딩 상태 설정
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // 에러 설정
    setError: (state, action) => {
      state.error = action.payload;
    },

    // 마지막 업데이트 시간 설정
    setLastUpdated: (state, action) => {
      state.lastUpdated = action.payload;
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
        if (action.payload.userProfile)
          state.userProfile = action.payload.userProfile;
        if (action.payload.academy) state.academy = action.payload.academy;
        if (action.payload.enrollments)
          state.enrollments = action.payload.enrollments;
        if (action.payload.refundRequests)
          state.refundRequests = action.payload.refundRequests;
        if (action.payload.classes) state.classes = action.payload.classes;
        if (action.payload.teachers) state.teachers = action.payload.teachers;
        if (action.payload.students) state.students = action.payload.students;

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
            academy,
            enrollments,
            refundRequests,
            classes,
            teachers,
            students,
            userProfile,
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
            students: adminStudents,
            teachers: adminTeachers,
            classes: adminClasses,
          };
          break;

        case "STUDENT":
          const [studentClasses, studentEnrollments] = await Promise.all([
            fetchStudentClassesData(userId),
            fetchStudentEnrollmentsData(userId),
          ]);

          data = {
            ...data,
            classes: studentClasses,
            enrollments: studentEnrollments,
          };
          break;

        case "TEACHER":
          const [teacherClasses, teacherStudents] = await Promise.all([
            fetchTeacherClassesData(userId),
            fetchTeacherStudentsData(userId),
          ]);

          data = {
            ...data,
            classes: teacherClasses,
            students: teacherStudents,
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
  setUserProfile,
  updateUserProfile,
  setAcademy,
  updateAcademy,
  updateEnrollment,
  updateEnrollmentFromSocket,
  updateRefundRequest,
  updateRefundRequestFromSocket,
  updateClass,
  updateTeacher,
  updateStudent,
  setLoading,
  setError,
  setLastUpdated,
  clearAppData,
} = appDataSlice.actions;

export default appDataSlice.reducer;
