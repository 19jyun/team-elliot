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
  approvePrincipalEnrollment,
  rejectPrincipalEnrollment,
  approvePrincipalRefund,
  rejectPrincipalRefund,
  updatePrincipalProfile,
  updatePrincipalProfilePhoto,
  createPrincipalClass,
  getSessionContents as apiGetSessionContents,
  addSessionContent as apiAddSessionContent,
  updateSessionContent as apiUpdateSessionContent,
  deleteSessionContent as apiDeleteSessionContent,
  reorderSessionContents as apiReorderSessionContents,
  removePrincipalTeacher,
  removePrincipalStudent,
  getPrincipalStudentSessionHistory,
  updatePrincipalAcademy,
} from "@/api/principal";
import type {
  PrincipalProfile,
  PrincipalAcademy,
  PrincipalClass,
  PrincipalTeacher,
  PrincipalStudent,
  PrincipalSession,
  UpdatePrincipalProfileRequest,
} from "@/types/api/principal";
import type { BalletPose, PoseDifficulty } from "@/types/api/ballet-pose";
import { getBalletPoses, getBalletPose } from "@/api/ballet-pose";
import { useApiError } from "@/hooks/useApiError";

// Principal API 데이터 훅
export function usePrincipalApi() {
  const { data: session, status } = useSession();
  const { handleApiError } = useApiError();
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
  const loadProfile = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      setIsLoading(true);
      const response = await getPrincipalProfile();
      const data = response.data;
      if (data) {
        setProfile(data);
      }
    } catch (err: any) {
      handleApiError(err);
      setError(err.message || "프로필 로드 실패");
    } finally {
      setIsLoading(false);
    }
  }, [isPrincipal, handleApiError]);

  // 학원 정보 로드
  const loadAcademy = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const response = await getPrincipalAcademy();
      const data = response.data;
      if (data) {
        setAcademy(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "학원 정보 로드 실패");
    }
  }, [isPrincipal]);

  // 클래스 목록 로드
  const loadClasses = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const response = await getPrincipalAllClasses();
      const data = response.data;
      if (data) {
        setClasses(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "클래스 목록 로드 실패");
    }
  }, [isPrincipal]);

  // 선생님 목록 로드
  const loadTeachers = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const response = await getPrincipalAllTeachers();
      const data = response.data;
      if (data) {
        setTeachers(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "선생님 목록 로드 실패");
    }
  }, [isPrincipal]);

  // 학생 목록 로드
  const loadStudents = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const response = await getPrincipalAllStudents();
      const data = response.data;
      if (data) {
        setStudents(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "학생 목록 로드 실패");
    }
  }, [isPrincipal]);

  // 세션 목록 로드
  const loadSessions = useCallback(async () => {
    if (!isPrincipal) return;

    try {
      setError(null);
      const response = await getPrincipalAllSessions();
      const data = response.data;
      if (data) {
        setSessions(data);
      }
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
        const response = await getPrincipalSessionEnrollments(sessionId);
        const data = response.data;
        return data || null;
      } catch (err: any) {
        setError(err.response?.data?.message || "수강생 목록 로드 실패");
        return null;
      }
    },
    [isPrincipal]
  );

  // 모든 데이터 로드
  const loadAllData = useCallback(async () => {
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
  }, [
    isPrincipal,
    loadProfile,
    loadAcademy,
    loadClasses,
    loadTeachers,
    loadStudents,
    loadSessions,
  ]);

  // 업데이트/액션 래퍼들 (컴포넌트에서 API 직접 호출 금지 목적)
  const updateProfile = async (data: UpdatePrincipalProfileRequest) => {
    const response = await updatePrincipalProfile(data);

    // 프로필 업데이트 후 데이터 다시 로드
    await loadProfile();

    return response;
  };
  const updateProfilePhoto = async (photo: File) => {
    return updatePrincipalProfilePhoto(photo);
  };

  // 클래스 생성
  const createClass = async (data: any) => {
    return createPrincipalClass(data);
  };

  // 세션 컨텐츠 관리
  const getSessionContents = async (sessionId: number) => {
    return apiGetSessionContents(sessionId);
  };
  const addSessionContent = async (
    sessionId: number,
    data: { poseId: number; note?: string }
  ) => {
    return apiAddSessionContent(sessionId, data);
  };
  const updateSessionContent = async (
    sessionId: number,
    contentId: number,
    data: { poseId?: number; note?: string }
  ) => {
    return apiUpdateSessionContent(sessionId, contentId, data);
  };
  const deleteSessionContent = async (sessionId: number, contentId: number) => {
    return apiDeleteSessionContent(sessionId, contentId);
  };
  const reorderSessionContents = async (
    sessionId: number,
    orderedContentIds: number[]
  ) => {
    return apiReorderSessionContents(sessionId, { orderedContentIds });
  };

  // 인원 관리
  const removeTeacher = async (teacherId: number) => {
    return removePrincipalTeacher(teacherId);
  };
  const removeStudent = async (studentId: number) => {
    return removePrincipalStudent(studentId);
  };
  const getStudentSessionHistory = async (studentId: number) => {
    return getPrincipalStudentSessionHistory(studentId);
  };

  // 학원 정보 업데이트
  const updateAcademy = async (data: any) => {
    return updatePrincipalAcademy(data);
  };

  // 발레 포즈 (Principal에서 사용)
  const fetchBalletPoses = async (
    difficulty?: PoseDifficulty
  ): Promise<BalletPose[]> => {
    const response = await getBalletPoses(difficulty);
    // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
    return response.data || [];
  };
  const fetchBalletPose = async (id: number): Promise<BalletPose> => {
    const response = await getBalletPose(id);
    // 백엔드 응답이 { success, data, timestamp } 구조이므로 data 부분 사용
    return response.data!;
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

  // 수강신청 승인
  const approveEnrollment = async (enrollmentId: number) => {
    if (!isPrincipal) throw new Error("Principal 권한이 필요합니다.");

    try {
      setError(null);
      const data = await approvePrincipalEnrollment(enrollmentId);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "수강신청 승인 실패";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 수강신청 거절
  const rejectEnrollment = async (
    enrollmentId: number,
    reason: string,
    detailedReason?: string
  ) => {
    if (!isPrincipal) throw new Error("Principal 권한이 필요합니다.");

    try {
      setError(null);
      const data = await rejectPrincipalEnrollment(enrollmentId, {
        reason,
        detailedReason,
      });
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "수강신청 거절 실패";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 환불요청 승인
  const approveRefund = async (refundId: number) => {
    if (!isPrincipal) throw new Error("Principal 권한이 필요합니다.");

    try {
      setError(null);
      const data = await approvePrincipalRefund(refundId);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "환불요청 승인 실패";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 환불요청 거절
  const rejectRefund = async (
    refundId: number,
    reason: string,
    detailedReason?: string
  ) => {
    if (!isPrincipal) throw new Error("Principal 권한이 필요합니다.");

    try {
      setError(null);
      const data = await rejectPrincipalRefund(refundId, {
        reason,
        detailedReason,
      });
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "환불요청 거절 실패";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
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

    // 승인/거절 함수들
    approveEnrollment,
    rejectEnrollment,
    approveRefund,
    rejectRefund,
    updateProfile,
    updateProfilePhoto,
    // 생성/수정 관련
    createClass,
    updateAcademy,
    // 발레 포즈
    fetchBalletPoses,
    fetchBalletPose,
    // 세션 컨텐츠 관련
    getSessionContents,
    addSessionContent,
    updateSessionContent,
    deleteSessionContent,
    reorderSessionContents,
    // 인원 관리 관련
    removeTeacher,
    removeStudent,
    getStudentSessionHistory,
  };
}
