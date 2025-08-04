import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  getTeacherProfile,
  getTeacherClassesWithSessions,
  getMyAcademy,
} from "@/api/teacher";
import type {
  TeacherProfileResponse,
  TeacherClassesWithSessionsResponse,
  Academy,
  Principal,
} from "@/types/api/teacher";

// Teacher API 데이터 훅
export function useTeacherApi() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Teacher가 아닌 경우 데이터 로드하지 않음
  const isTeacher =
    status === "authenticated" && session?.user?.role === "TEACHER";

  // 프로필 정보 로드
  const loadProfile = useCallback(async () => {
    if (!isTeacher) return;

    try {
      setError(null);
      const data = await getTeacherProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "프로필 로드 실패");
    }
  }, [isTeacher]);

  // 학원 정보 로드
  const loadAcademy = useCallback(async () => {
    if (!isTeacher) return;

    try {
      setError(null);
      const data = await getMyAcademy();
      setAcademy(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "학원 정보 로드 실패");
    }
  }, [isTeacher]);

  // 클래스와 세션 목록 로드
  const loadClasses = useCallback(async () => {
    if (!isTeacher) return;

    try {
      setError(null);
      const data = await getTeacherClassesWithSessions();
      setClasses(data.classes || []);
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "클래스 및 세션 목록 로드 실패");
    }
  }, [isTeacher]);

  // 모든 데이터 로드
  const loadAllData = async () => {
    if (!isTeacher) return;

    try {
      setIsLoading(true);
      setError(null);

      await Promise.all([loadProfile(), loadAcademy(), loadClasses()]);
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

  const getSessionById = (sessionId: number) => {
    return sessions.find((session) => session.id === sessionId);
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

  const getTeacherById = (teacherId: number) => {
    return profile;
  };

  return {
    // 데이터
    profile,
    academy,
    classes,
    sessions,
    isLoading,
    error,
    isTeacher,

    // 로드 함수들
    loadProfile,
    loadAcademy,
    loadClasses,
    loadAllData,

    // 헬퍼 함수들
    getClassById,
    getSessionById,
    getSessionsByClassId,
    getSessionsByDate,
    getTeacherById,
  };
}
