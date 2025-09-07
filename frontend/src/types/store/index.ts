// Store 타입들 통합 export

// 공통 타입들
export * from "./common";

// 역할별 타입들
export type { PrincipalData, PrincipalState } from "./principal";
export type { StudentData, StudentState } from "./student";
// ADMIN 타입 제거됨

// 역할별 데이터 유니온 타입
export type RoleSpecificData =
  | { role: "PRINCIPAL"; data: import("./principal").PrincipalData }
  | { role: "STUDENT"; data: import("./student").StudentData };
