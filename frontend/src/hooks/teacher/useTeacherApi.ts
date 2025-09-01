import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  getTeacherProfile,
  getTeacherClassesWithSessions,
  getMyAcademy,
  getSessionEnrollments,
  updateEnrollmentStatus,
  updateTeacherProfile,
  updateTeacherProfilePhoto,
} from "@/api/teacher";
import type {
  TeacherProfileResponse,
  Academy,
  UpdateEnrollmentStatusRequest,
  UpdateProfileRequest,
  TeacherClass,
  TeacherSession,
} from "@/types/api/teacher";
import { useApiError } from "@/hooks/useApiError";

// Teacher API 데이터 훅
export function useTeacherApi() {
  const { data: session, status } = useSession();
  const {} = useApiError();
  const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [sessions, setSessions] = useState<TeacherSession[]>([]);
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
      const response = await getTeacherProfile();
      // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
      setProfile(response.data || null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "프로필 로드 실패");
    }
  }, [isTeacher]);

  // 학원 정보 로드
  const loadAcademy = useCallback(async () => {
    if (!isTeacher) return;

    try {
      setError(null);
      const response = await getMyAcademy();
      // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
      setAcademy(response.data || null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "학원 정보 로드 실패");
    }
  }, [isTeacher]);

  // 클래스와 세션 목록 로드
  const loadClasses = useCallback(async () => {
    if (!isTeacher) return;

    try {
      setError(null);
      const response = await getTeacherClassesWithSessions();
      // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
      const data = response.data;
      if (data) {
        setClasses(data || []);
        // TeacherClassesWithSessionsResponse는 클래스 배열이므로 세션은 별도로 처리
        const allSessions: TeacherSession[] = [];
        data.forEach((cls) => {
          if (cls.sessions) {
            // ClassSession을 TeacherSession으로 변환
            cls.sessions.forEach((session) => {
              allSessions.push({
                id: session.id,
                date: session.date,
                startTime: session.startTime,
                endTime: session.endTime,
                class: {
                  id: cls.id,
                  className: cls.className,
                  maxStudents: cls.maxStudents,
                  level: cls.level,
                  teacher: {
                    id: profile?.id || 0,
                    name: profile?.name || "",
                  },
                },
                enrollmentCount: session.enrollments?.length || 0,
                confirmedCount:
                  session.enrollments?.filter((e) => e.status === "CONFIRMED")
                    .length || 0,
              });
            });
          }
        });
        setSessions(allSessions);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "클래스 및 세션 목록 로드 실패"
      );
    }
  }, [isTeacher, profile]);

  // 세션 수강생 목록 로드
  const loadSessionEnrollments = useCallback(
    async (sessionId: number) => {
      if (!isTeacher || !sessionId) return null;

      try {
        setError(null);
        const response = await getSessionEnrollments(sessionId);
        // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
        return response.data;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "수강생 목록 로드 실패");
        return null;
      }
    },
    [isTeacher]
  );

  // 수강생 상태 업데이트
  const updateEnrollmentStatusHandler = useCallback(
    async (
      enrollmentId: number,
      data: UpdateEnrollmentStatusRequest
    ): Promise<unknown> => {
      if (!isTeacher) return null;

      try {
        setError(null);
        const response = await updateEnrollmentStatus(enrollmentId, data);
        // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
        return response.data;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "수강생 상태 업데이트 실패");
        return null;
      }
    },
    [isTeacher]
  );

  // 프로필 업데이트
  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      if (!isTeacher) return null;

      try {
        setError(null);

        const response = await updateTeacherProfile(data);

        // 프로필 업데이트 후 데이터 다시 로드
        await loadProfile();

        // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
        return response.data;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "프로필 업데이트 실패");
        return null;
      }
    },
    [isTeacher, loadProfile]
  );

  // 프로필 사진 업데이트
  const updateProfilePhoto = useCallback(
    async (photo: File) => {
      if (!isTeacher) return null;

      try {
        setError(null);
        const response = await updateTeacherProfilePhoto(photo);
        // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
        return response.data;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "프로필 사진 업데이트 실패");
        return null;
      }
    },
    [isTeacher]
  );

  // 모든 데이터 로드
  const loadAllData = async () => {
    if (!isTeacher) return;

    try {
      setIsLoading(true);
      setError(null);

      await Promise.all([loadProfile(), loadAcademy(), loadClasses()]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "데이터 로드 실패");
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
    return sessions.filter((session) => session.class.id === classId);
  };

  const getSessionsByDate = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const getTeacherById = (_teacherId: number) => {
    return profile;
  };

  // 학생용 노출: teacherId로 프로필 로드 (백엔드에 id 조회가 없으면 내 프로필로 fallback)
  const loadProfileById = useCallback(
    async (teacherId: number) => {
      try {
        setError(null);
        if (!teacherId) return null;
        if (profile && profile.id === teacherId) return profile;
        const response = await getTeacherProfile();
        // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
        return response.data;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "프로필 로드 실패");
        return null;
      }
    },
    [profile]
  );

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
    loadSessions: loadClasses, // loadClasses의 별칭
    loadAllData,
    loadSessionEnrollments,

    // 업데이트/액션 함수들
    updateEnrollmentStatus: updateEnrollmentStatusHandler,
    updateProfile,
    updateProfilePhoto,
    loadProfileById,

    // 헬퍼 함수들
    getClassById,
    getSessionById,
    getSessionsByClassId,
    getSessionsByDate,
    getTeacherById,
  };
}
