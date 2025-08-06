import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  getPrincipalProfile,
  getPrincipalAcademy,
  getPrincipalAllClasses,
  getPrincipalAllTeachers,
  getPrincipalAllStudents,
  getPrincipalAllSessions,
  getPrincipalSessionEnrollments,
} from "@/api/principal";
import type {
  PrincipalProfile,
  PrincipalAcademy,
  PrincipalClass,
  PrincipalTeacher,
  PrincipalStudent,
  PrincipalSession,
} from "@/types/api/principal";

// Principal API 데이터 훅
export function usePrincipalApi() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<PrincipalProfile | null>(null);
  const [academy, setAcademy] = useState<PrincipalAcademy | null>(null);
  const [classes, setClasses] = useState<PrincipalClass[]>([]);
  const [teachers, setTeachers] = useState<PrincipalTeacher[]>([]);
  const [students, setStudents] = useState<PrincipalStudent[]>([]);
  const [sessions, setSessions] = useState<PrincipalSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Principal이 아닌 경우 데이터 로드하지 않음
  const isPrincipal =
    status === "authenticated" && session?.user?.role === "PRINCIPAL";

  // 프로필 정보 로드
  const loadProfile = async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const data = await getPrincipalProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "프로필 로드 실패");
    }
  };

  // 학원 정보 로드
  const loadAcademy = async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const data = await getPrincipalAcademy();
      setAcademy(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "학원 정보 로드 실패");
    }
  };

  // 클래스 목록 로드
  const loadClasses = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const data = await getPrincipalAllClasses();
      setClasses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "클래스 목록 로드 실패");
    }
  }, [isPrincipal]);

  // 선생님 목록 로드
  const loadTeachers = async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const data = await getPrincipalAllTeachers();
      setTeachers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "선생님 목록 로드 실패");
    }
  };

  // 학생 목록 로드
  const loadStudents = async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const data = await getPrincipalAllStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "학생 목록 로드 실패");
    }
  };

  // 세션 목록 로드
  const loadSessions = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const data = await getPrincipalAllSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "세션 목록 로드 실패");
    }
  }, [isPrincipal]);

  // 세션 수강생 목록 로드
  const loadSessionEnrollments = useCallback(
    async (sessionId: number) => {
      if (!isPrincipal || !sessionId) return null;

      try {
        setError(null);
        const data = await getPrincipalSessionEnrollments(sessionId);
        return data;
      } catch (err: any) {
        setError(err.response?.data?.message || "수강생 목록 로드 실패");
        return null;
      }
    },
    [isPrincipal]
  );

  // 모든 데이터 로드
  const loadAllData = async () => {
    if (!isPrincipal) return;

    try {
      setIsLoading(true);
      setError(null);

      await Promise.all([
        loadProfile(),
        loadAcademy(),
        loadClasses(),
        loadTeachers(),
        loadStudents(),
        loadSessions(),
      ]);
    } catch (err: any) {
      setError(err.response?.data?.message || "데이터 로드 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 헬퍼 함수들
  const getClassById = (classId: number) => {
    return classes.find((cls) => cls.id === classId);
  };

  const getTeacherById = (teacherId: number) => {
    return teachers.find((teacher) => teacher.id === teacherId);
  };

  const getStudentById = (studentId: number) => {
    return students.find((student) => student.id === studentId);
  };

  const getSessionsByClassId = (classId: number) => {
    return sessions.filter((session) => session.classId === classId);
  };

  const getSessionsByDate = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  return {
    // 데이터
    profile,
    academy,
    classes,
    teachers,
    students,
    sessions,
    isLoading,
    error,
    isPrincipal,

    // 로드 함수들
    loadProfile,
    loadAcademy,
    loadClasses,
    loadTeachers,
    loadStudents,
    loadSessions,
    loadAllData,
    loadSessionEnrollments,

    // 헬퍼 함수들
    getClassById,
    getTeacherById,
    getStudentById,
    getSessionsByClassId,
    getSessionsByDate,
  };
}
