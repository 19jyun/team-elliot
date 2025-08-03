// Store slices 통합 export

// 공통 slice
export {
  default as commonReducer,
  setUser,
  setLoading,
  setError,
  setLastUpdated,
  clearCommonData,
} from "./commonSlice";

// 역할별 slice들
export {
  default as teacherReducer,
  setTeacherData,
  updateTeacherProfile,
  updateTeacherAcademy,
  updateTeacherPrincipal,
  updateTeacherClass,
  updateTeacherSession,
  updateTeacherEnrollment,
  updateTeacherEnrollmentFromSocket,
  updateTeacherSessionFromSocket,
  clearTeacherData,
} from "./teacherSlice";

export {
  default as principalReducer,
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
  clearPrincipalData,
} from "./principalSlice";

export {
  default as studentReducer,
  setStudentData,
  clearStudentData,
} from "./studentSlice";

export {
  default as adminReducer,
  setAdminData,
  clearAdminData,
} from "./adminSlice";
