import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * 권한 관리 Slice
 *
 * 역할별 권한을 관리하는 글로벌 비즈니스 상태
 */

interface PermissionState {
  // 역할별 권한 플래그
  permissions: {
    canManageEnrollments: boolean;
    canManageRefunds: boolean;
    canManageTeachers: boolean;
    canManageStudents: boolean;
    canCreateClasses: boolean;
    canViewCalendar: boolean;
    canManageAcademy: boolean;
    canJoinAcademy: boolean;
    canRequestRefund: boolean;
    canEnrollSessions: boolean;
  };

  // 권한 체크 캐시 (선택적 최적화용)
  permissionCache: Record<string, boolean>;
}

const initialState: PermissionState = {
  permissions: {
    canManageEnrollments: false,
    canManageRefunds: false,
    canManageTeachers: false,
    canManageStudents: false,
    canCreateClasses: false,
    canViewCalendar: false,
    canManageAcademy: false,
    canJoinAcademy: false,
    canRequestRefund: false,
    canEnrollSessions: false,
  },
  permissionCache: {},
};

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    // 역할에 따른 권한 설정
    setPermissionsByRole: (
      state,
      action: PayloadAction<"STUDENT" | "TEACHER" | "PRINCIPAL">
    ) => {
      const role = action.payload;

      switch (role) {
        case "PRINCIPAL":
          state.permissions = {
            canManageEnrollments: true,
            canManageRefunds: true,
            canManageTeachers: true,
            canManageStudents: true,
            canCreateClasses: true,
            canViewCalendar: true,
            canManageAcademy: true,
            canJoinAcademy: false,
            canRequestRefund: false,
            canEnrollSessions: false,
          };
          break;
        case "TEACHER":
          state.permissions = {
            canManageEnrollments: false,
            canManageRefunds: false,
            canManageTeachers: false,
            canManageStudents: false,
            canCreateClasses: false,
            canViewCalendar: true,
            canManageAcademy: false,
            canJoinAcademy: false,
            canRequestRefund: false,
            canEnrollSessions: false,
          };
          break;
        case "STUDENT":
          state.permissions = {
            canManageEnrollments: false,
            canManageRefunds: false,
            canManageTeachers: false,
            canManageStudents: false,
            canCreateClasses: false,
            canViewCalendar: true,
            canManageAcademy: false,
            canJoinAcademy: true,
            canRequestRefund: true,
            canEnrollSessions: true,
          };
          break;
      }

      // 권한 변경 시 캐시 클리어
      state.permissionCache = {};
    },

    // 권한 캐시 설정
    setPermissionCache: (
      state,
      action: PayloadAction<{ key: string; value: boolean }>
    ) => {
      state.permissionCache[action.payload.key] = action.payload.value;
    },

    // 권한 캐시 클리어
    clearPermissionCache: (state) => {
      state.permissionCache = {};
    },

    // 모든 권한 초기화
    resetPermissions: (state) => {
      state.permissions = initialState.permissions;
      state.permissionCache = {};
    },
  },
});

export const {
  setPermissionsByRole,
  setPermissionCache,
  clearPermissionCache,
  resetPermissions,
} = permissionSlice.actions;

export default permissionSlice.reducer;
