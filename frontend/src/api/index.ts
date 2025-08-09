// 역할별 API만 re-export
export * as PrincipalAPI from "./principal";
export * as StudentAPI from "./student";
export * as TeacherAPI from "./teacher";

// 인증만 공용 노출
export {
  login,
  signup,
  logout,
  checkDuplicateUserId,
  withdrawal,
} from "./auth";
