// Teacher APIs
export {
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherClasses,
  getTeacherClassesWithSessions,
  getSessionEnrollments,
  updateClassDetails,
  getMyAcademy,
  changeAcademy,
  createAcademy,
  createAndJoinAcademy,
} from "./teacher";

// Class Sessions API
export {
  getClassSessions,
  getClassSession,
  enrollSession,
  batchEnrollSessions,
  getStudentClassEnrollments,
  cancelEnrollment,
  changeEnrollment,
  batchModifyEnrollments,
  updateEnrollmentStatus,
  batchUpdateEnrollmentStatus,
  checkAttendance,
} from "./class-sessions";

// Ballet Pose API
export {
  getBalletPoses,
  getBalletPose,
  createBalletPose,
  updateBalletPose,
  deleteBalletPose,
} from "./ballet-pose";

// Session Content API
export {
  getSessionContents,
  getSessionContent,
  addSessionContent,
  updateSessionContent,
  deleteSessionContent,
  reorderSessionContents,
} from "./session-content";

// Refund API
export { refundApi } from "./refund";

// Student API
export {
  getMyClasses,
  getClassDetail,
  enrollClass,
  unenrollClass,
  getMyProfile,
  updateMyProfile,
} from "./student";

// Auth API
export {
  login,
  signup,
  logout,
  withdrawal,
  checkDuplicateUserId,
} from "./auth";

// Admin API
export {
  getStudents,
  getTeachers,
  getClasses,
  getWithdrawalStats,
  createStudent,
  createTeacher,
  createClass,
  deleteStudent,
  deleteTeacher,
  deleteClass,
  resetStudentPassword,
  generateSessionsForClass,
  generateSessionsForPeriod,
} from "./admin";

// Academy API
export { getAcademies, joinAcademy, leaveAcademy } from "./academy";
