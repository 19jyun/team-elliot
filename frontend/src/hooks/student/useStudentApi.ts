import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  setCalendarSessions,
  setCalendarRange,
} from "@/store/slices/studentSlice";
import {
  getMyClasses,
  getEnrollmentHistory,
  getMyProfile,
  updateMyProfile,
  getSessionPaymentInfo,
  getCancellationHistory,
} from "@/api/student";
import {
  getAcademies,
  getMyAcademies,
  joinAcademy,
  leaveAcademy,
} from "@/api/student";
import {
  getStudentAvailableSessionsForEnrollment,
  batchEnrollSessions,
  getClassSessionsForModification,
  batchModifyEnrollments,
} from "@/api/student";
import { refundApi } from "@/api/refund";
import type {
  CreateRefundRequestDto,
  CreateRefundRequestResponse,
} from "@/types/api/refund";
import type { ClassDetailsResponse } from "@/types/api/class";
import { getClassDetails as getClassDetailsApi } from "@/api/class";
import { useApiError } from "@/hooks/useApiError";

// Student 대시보드에서 사용할 API 훅
export function useStudentApi() {
  const dispatch = useAppDispatch();
  const { handleApiError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionClasses, setSessionClasses] = useState<any[]>([]);
  const [academies, setAcademies] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);
  const [enrollmentHistory, setEnrollmentHistory] = useState<any[]>([]);
  const [cancellationHistory, setCancellationHistory] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [calendarRange, setCalendarRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  // 학원 목록 로드 함수
  const loadAcademies = useCallback(async () => {
    try {
      const response = await getMyAcademies();
      setAcademies(response.data || []);
    } catch (err) {
      console.error("Failed to load academies:", err);
      setAcademies([]);
    }
  }, []);

  // 수강 가능한 클래스/세션 로드 함수
  const loadAvailableClasses = useCallback(async (academyId?: number) => {
    try {
      if (!academyId) return;

      const response = await getStudentAvailableSessionsForEnrollment(
        academyId
      );

      // API 응답에서 세션 데이터 추출 (response.data.sessions)
      const sessions = response.data?.sessions || [];

      // 세션에서 클래스 정보를 추출하여 중복 제거
      const classMap = new Map<number, any>();
      sessions.forEach((session: any) => {
        if (session.class) {
          const classId = session.class.id;
          if (!classMap.has(classId)) {
            classMap.set(classId, {
              ...session.class,
              availableSessions: sessions.filter(
                (s: any) => s.classId === classId
              ),
            });
          }
        }
      });

      const classes = Array.from(classMap.values());

      setAvailableClasses(classes);
      setAvailableSessions(sessions);
    } catch (err) {
      console.error("수강 가능한 클래스 로드 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "수강 가능한 클래스를 불러오는데 실패했습니다."
      );
    }
  }, []);

  // 수강 가능한 세션 로드 함수 (별도로 필요할 경우)
  const loadAvailableSessions = useCallback(async (academyId?: number) => {
    try {
      if (!academyId) return;

      const data = await getStudentAvailableSessionsForEnrollment(academyId);
      const sessions = data.sessions || [];

      setAvailableSessions(sessions);
    } catch (err) {
      console.error("수강 가능한 세션 로드 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "수강 가능한 세션을 불러오는데 실패했습니다."
      );
    }
  }, []);

  // 배치 수강 신청 함수 (기존 로직 유지, 새로운 useEnrollment hook 사용 권장)
  const enrollSessions = useCallback(async (sessionIds: number[]) => {
    try {
      const result = await batchEnrollSessions(sessionIds);
      return result;
    } catch (err) {
      console.error("배치 수강 신청 실패:", err);
      setError(
        err instanceof Error ? err.message : "수강 신청에 실패했습니다."
      );
      throw err;
    }
  }, []);

  // 수강 신청 내역 로드 함수
  const loadEnrollmentHistory = useCallback(async () => {
    try {
      const response = await getEnrollmentHistory();
      const data = response.data;
      setEnrollmentHistory(data || []);
      return data || [];
    } catch (err) {
      console.error("수강 신청 내역 로드 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "수강 신청 내역을 불러오는데 실패했습니다."
      );
      throw err;
    }
  }, []);

  // 환불/취소 내역 로드 함수
  const loadCancellationHistory = useCallback(async () => {
    try {
      const response = await getCancellationHistory();
      const data = response.data;
      setCancellationHistory(data || []);
      return data || [];
    } catch (err) {
      console.error("환불/취소 내역 로드 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "환불/취소 내역을 불러오는데 실패했습니다."
      );
      throw err;
    }
  }, []);

  // 수강 변경용 세션 데이터 로드 함수
  const loadModificationSessions = useCallback(async (classId: number) => {
    try {
      const response = await getClassSessionsForModification(classId);
      return response.data;
    } catch (err) {
      console.error("수강 변경용 세션 데이터 로드 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "수강 변경용 세션 데이터를 불러오는데 실패했습니다."
      );
      throw err;
    }
  }, []);

  // 배치 수강 변경 함수
  const modifyEnrollments = useCallback(
    async (modificationData: {
      cancellations: number[];
      newEnrollments: number[];
      reason: string;
    }) => {
      try {
        const result = await batchModifyEnrollments(modificationData);
        return result;
      } catch (err) {
        console.error("배치 수강 변경 실패:", err);
        setError(
          err instanceof Error ? err.message : "수강 변경에 실패했습니다."
        );
        throw err;
      }
    },
    []
  );

  // 환불 요청 생성 (학생용) (기존 로직 유지, 새로운 useRefund hook 사용 권장)
  const createRefundRequest = useCallback(
    async (
      data: CreateRefundRequestDto
    ): Promise<CreateRefundRequestResponse> => {
      try {
        const res = await refundApi.createRefundRequest(data);
        return res;
      } catch (err) {
        console.error("환불 요청 생성 실패:", err);
        setError(
          err instanceof Error ? err.message : "환불 요청 생성에 실패했습니다."
        );
        throw err;
      }
    },
    []
  );

  // 사용자 프로필 로드 함수
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await getMyProfile();
      const data = response.data;
      setUserProfile(data || null);
    } catch (err) {
      console.error("사용자 프로필 로드 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "사용자 프로필을 불러오는데 실패했습니다."
      );
    }
  }, []);

  // 사용자 프로필 업데이트 함수 (변경된 필드만 전송, 날짜 ISO 포맷 변환)
  const updateUserProfile = useCallback(
    async (profileData: any) => {
      try {
        const sanitized: Record<string, any> = {};
        Object.entries(profileData || {}).forEach(([key, value]) => {
          if (value === "" || value === undefined || value === null) return;

          if (key === "birthDate" && typeof value === "string") {
            // 'YYYY-MM-DD' 입력을 ISO 8601 문자열로 변환
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              sanitized[key] = date.toISOString();
              return;
            }
          }
          sanitized[key] = value;
        });

        const result = await updateMyProfile(sanitized);
        await loadUserProfile();
        return result;
      } catch (err) {
        console.error("사용자 프로필 업데이트 실패:", err);
        setError(
          err instanceof Error
            ? err.message
            : "사용자 프로필 업데이트에 실패했습니다."
        );
        throw err;
      }
    },
    [loadUserProfile]
  );

  // 학원 가입 함수
  const joinAcademyApi = useCallback(
    async (academyData: { code: string }) => {
      try {
        const result = await joinAcademy(academyData);
        // 가입 후 학원 목록 다시 로드
        await loadAcademies();
        return result;
      } catch (err) {
        console.error("학원 가입 실패:", err);
        setError(
          err instanceof Error ? err.message : "학원 가입에 실패했습니다."
        );
        throw err;
      }
    },
    [loadAcademies]
  );

  // 학원 탈퇴 함수
  const leaveAcademyApi = useCallback(
    async (academyData: { academyId: number }) => {
      try {
        const result = await leaveAcademy(academyData);
        // 탈퇴 후 학원 목록 다시 로드
        await loadAcademies();
        return result;
      } catch (err) {
        console.error("학원 탈퇴 실패:", err);
        setError(
          err instanceof Error ? err.message : "학원 탈퇴에 실패했습니다."
        );
        throw err;
      }
    },
    [loadAcademies]
  );

  // 세션별 입금 정보 조회
  const loadSessionPaymentInfo = useCallback(async (sessionId: number) => {
    try {
      const data = await getSessionPaymentInfo(sessionId);
      return data;
    } catch (err) {
      console.error("세션 입금 정보 로드 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "입금 정보를 불러오는데 실패했습니다."
      );
      throw err;
    }
  }, []);

  // 클래스 상세 조회 (학생 화면용)
  const getClassDetails = useCallback(async (classId: number) => {
    const response = await getClassDetailsApi(classId);
    return response.data;
  }, []);

  // 캘린더용 세션 데이터 변환 (ConnectedCalendar에서 사용)
  const convertedSessions = useMemo(() => {
    if (!sessionClasses || sessionClasses.length === 0) {
      return [];
    }

    return sessionClasses.map((session: any) => ({
      id: session.id,
      classId: session.classId || session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      currentStudents: session.currentStudents || 0,
      maxStudents: session.maxStudents || 0,
      isEnrollable: false, // student-view에서는 선택 불가
      isFull: session.currentStudents >= session.maxStudents,
      isPastStartTime:
        new Date(session.date + " " + session.startTime) < new Date(),
      isAlreadyEnrolled: true, // 이미 수강 중인 세션
      studentEnrollmentStatus: "CONFIRMED",
      class: {
        id: session.class?.id || session.classId || session.id,
        className: session.class?.className || "클래스",
        level: session.class?.level || "BEGINNER",
        tuitionFee: session.class?.tuitionFee?.toString() || "50000",
        teacher: {
          id: session.class?.teacher?.id || 0,
          name: session.class?.teacher?.name || "선생님",
        },
      },
    }));
  }, [sessionClasses]);

  // 캘린더 범위 계산
  const computedCalendarRange = useMemo(() => {
    if (!calendarRange) {
      // 백엔드에서 범위를 받지 못한 경우 기본값 사용
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
      };
    }

    return {
      startDate: new Date(calendarRange.startDate),
      endDate: new Date(calendarRange.endDate),
    };
  }, [calendarRange]);

  // 날짜별 세션 조회 함수 (DateSessionModal용)
  const getSessionsByDate = useCallback(
    (date: Date) => {
      if (!convertedSessions || convertedSessions.length === 0) return [];

      const targetDate = date.toISOString().split("T")[0]; // YYYY-MM-DD 형식

      return convertedSessions.filter((session) => {
        const sessionDate = new Date(session.date).toISOString().split("T")[0];
        return sessionDate === targetDate;
      });
    },
    [convertedSessions]
  );

  return {
    // 기본 데이터
    sessionClasses,
    academies,
    availableClasses,
    availableSessions,
    enrollmentHistory,
    cancellationHistory,
    userProfile,

    // 변환된 데이터
    convertedSessions,

    // 캘린더 관련 (Redux store에서 가져옴)
    calendarRange: computedCalendarRange,

    // 상태
    isLoading,
    error,

    // 헬퍼 함수들
    getSessionsByDate,

    loadAcademies,
    loadAvailableClasses,
    loadAvailableSessions,
    loadEnrollmentHistory,
    loadCancellationHistory,

    // 수강 신청
    enrollSessions,

    // 수강 변경
    loadModificationSessions,
    modifyEnrollments,
    // 환불
    createRefundRequest,

    // 프로필 관리
    loadUserProfile,
    updateUserProfile,

    // 학원 관리
    joinAcademyApi,
    leaveAcademyApi,

    // 세션별 입금 정보
    loadSessionPaymentInfo,

    // 클래스 상세
    getClassDetails,
  };
}
