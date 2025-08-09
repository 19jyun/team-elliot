import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// 타입이 지정된 Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 역할별 데이터 접근을 위한 편의 hooks
export const useCommonData = () => useAppSelector((state) => state.common);
export const useTeacherData = () => useAppSelector((state) => state.teacher);
export const usePrincipalData = () =>
  useAppSelector((state) => state.principal);
export const useStudentData = () => useAppSelector((state) => state.student);
// ADMIN 데이터 훅 제거됨
