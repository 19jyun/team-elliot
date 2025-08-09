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
  setTeacherRealTimeData,
  updateTeacherEnrollment,
  updateTeacherEnrollmentFromSocket,
  clearTeacherData,
} from "./teacherSlice";

export {
  default as principalReducer,
  setPrincipalData,
  updatePrincipalEnrollment,
  updatePrincipalRefundRequest,
  updatePrincipalEnrollmentFromSocket,
  updatePrincipalRefundRequestFromSocket,
  clearPrincipalData,
} from "./principalSlice";

export {
  default as studentReducer,
  setStudentData,
  clearStudentData,
} from "./studentSlice";

// ADMIN slice 제거됨
