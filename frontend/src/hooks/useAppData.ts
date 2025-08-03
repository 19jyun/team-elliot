import { useAppSelector } from "@/store/hooks";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchEnrollmentsData,
  fetchRefundRequestsData,
  fetchClassesData,
  fetchTeachersData,
  fetchStudentsData,
} from "@/store/api/appDataApi";

// 수강신청 데이터 훅
export function useEnrollments() {
  const enrollments = useAppSelector((state) => state.appData.enrollments);
  const { data: queryEnrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => fetchEnrollmentsData(0), // userId는 실제로는 필요하지 않음
    enabled: enrollments.length === 0, // Redux에 데이터가 없을 때만 실행
  });

  return enrollments.length > 0 ? enrollments : queryEnrollments || [];
}

// 환불 요청 데이터 훅
export function useRefundRequests() {
  const refundRequests = useAppSelector(
    (state) => state.appData.refundRequests
  );
  const { data: queryRefundRequests } = useQuery({
    queryKey: ["refund-requests"],
    queryFn: () => fetchRefundRequestsData(0),
    enabled: refundRequests.length === 0,
  });

  return refundRequests.length > 0 ? refundRequests : queryRefundRequests || [];
}

// 클래스 데이터 훅
export function useClasses() {
  const classes = useAppSelector((state) => state.appData.classes);
  const { data: queryClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetchClassesData(0),
    enabled: classes.length === 0,
  });

  return classes.length > 0 ? classes : queryClasses || [];
}

// 선생님 데이터 훅
export function useTeachers() {
  const teachers = useAppSelector((state) => state.appData.teachers);
  const { data: queryTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => fetchTeachersData(0),
    enabled: teachers.length === 0,
  });

  return teachers.length > 0 ? teachers : queryTeachers || [];
}

// 학생 데이터 훅
export function useStudents() {
  const students = useAppSelector((state) => state.appData.students);
  const { data: queryStudents } = useQuery({
    queryKey: ["students"],
    queryFn: () => fetchStudentsData(0),
    enabled: students.length === 0,
  });

  return students.length > 0 ? students : queryStudents || [];
}

// 사용자 정보 훅
export function useUser() {
  return useAppSelector((state) => state.appData.user);
}

// 학원 정보 훅
export function useAcademy() {
  return useAppSelector((state) => state.appData.academy);
}

// 앱 상태 훅
export function useAppState() {
  const isLoading = useAppSelector((state) => state.appData.isLoading);
  const error = useAppSelector((state) => state.appData.error);
  const lastUpdated = useAppSelector((state) => state.appData.lastUpdated);

  return useMemo(
    () => ({
      isLoading,
      error,
      lastUpdated,
    }),
    [isLoading, error, lastUpdated]
  );
}
