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
// teacherSlice는 불필요하다고 판단해서 삭제

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
