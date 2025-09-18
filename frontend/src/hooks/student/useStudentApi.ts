import { useState, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "next-auth/react";
import {
  addOptimisticCancellation,
  replaceOptimisticCancellation,
  removeOptimisticCancellation,
} from "@/store/slices/studentSlice";

import {
  getEnrollmentHistory,
  getMyProfile,
  updateMyProfile,
  getSessionPaymentInfo,
  getCancellationHistory,
  getTeacherProfile,
} from "@/api/student";
import { getMyAcademies, joinAcademy, leaveAcademy } from "@/api/student";
import {
  getStudentAvailableSessionsForEnrollment,
  batchEnrollSessions,
  getClassSessionsForModification,
  batchModifyEnrollments,
} from "@/api/student";
import { refundApi } from "@/api/refund";
import type {
  CreateRefundRequestDto,
  RefundRequestResponse,
} from "@/types/api/refund";
import type { CancellationHistory } from "@/types/api/student";
import { extractErrorMessage } from "@/types/api/error";

import { getClassDetails as getClassDetailsApi } from "@/api/class";
import { useApiError } from "@/hooks/useApiError";
import type {
  StudentProfile,
  AvailableSessionForEnrollment,
  ClassSessionForEnrollment,
  EnrollmentHistory,
  UpdateStudentProfileRequest,
  GetMyAcademiesResponse,
  StudentBatchEnrollSessionsRequest,
  GetStudentAvailableSessionsForEnrollmentResponse,
} from "@/types/api/student";

// Student 대시보드에서 사용할 API 훅
export function useStudentApi() {
  const {} = useApiError();
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const [isLoading, _setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 중복 요청 방지를 위한 Set
  const pendingRequests = useRef<Set<string>>(new Set());
  const [sessionClasses, _setSessionClasses] = useState<
    ClassSessionForEnrollment[]
  >([]);
  const [academies, setAcademies] = useState<GetMyAcademiesResponse>([]);
  const [availableClasses, setAvailableClasses] = useState<
    AvailableSessionForEnrollment[]
  >([]);
  const [availableSessions, setAvailableSessions] = useState<
    AvailableSessionForEnrollment[]
  >([]);
  const [enrollmentHistory, setEnrollmentHistory] = useState<
    EnrollmentHistory[]
  >([]);
  const [cancellationHistory, setCancellationHistory] = useState<
    CancellationHistory[]
  >([]);
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);
  const [calendarRange, _setCalendarRange] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  // Student가 아닌 경우 데이터 로드하지 않음
  const isStudent =
    status === "authenticated" && session?.user?.role === "STUDENT";

  // 학원 목록 로드 함수
  const loadAcademies = useCallback(async () => {
    if (!isStudent) return;

    try {
      const response = await getMyAcademies();
      setAcademies(response.data || []);
    } catch (err) {
      console.error("Failed to load academies:", err);
      setAcademies([]);
    }
  }, [isStudent]);

  // 수강 가능한 클래스/세션 로드 함수
  const loadAvailableClasses = useCallback(
    async (academyId?: number) => {
      if (!isStudent) return;

      try {
        if (!academyId) return;

        const response = await getStudentAvailableSessionsForEnrollment(
          academyId
        );

        // API 응답 구조: { sessions: [...], calendarRange: {...} }
        const responseData =
          response.data as GetStudentAvailableSessionsForEnrollmentResponse;
        const sessions = responseData?.sessions || [];

        // 세션에서 클래스 정보를 추출하여 중복 제거
        const classMap = new Map<
          string,
          AvailableSessionForEnrollment & {
            availableSessions: AvailableSessionForEnrollment[];
          }
        >();
        sessions.forEach((session: AvailableSessionForEnrollment) => {
          const className = session.class.className;
          if (!classMap.has(className)) {
            classMap.set(className, {
              ...session,
              availableSessions: sessions.filter(
                (s: AvailableSessionForEnrollment) =>
                  s.class.className === className
              ),
            });
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
    },
    [isStudent]
  );

  // 수강 가능한 세션 로드 함수 (별도로 필요할 경우)
  const loadAvailableSessions = useCallback(async (academyId?: number) => {
    try {
      if (!academyId) return;

      const response = await getStudentAvailableSessionsForEnrollment(
        academyId
      );
      const responseData =
        response.data as GetStudentAvailableSessionsForEnrollmentResponse;
      const sessions = responseData?.sessions || [];

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
      const requestData: StudentBatchEnrollSessionsRequest = { sessionIds };
      const result = await batchEnrollSessions(requestData);
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
    async (data: CreateRefundRequestDto): Promise<RefundRequestResponse> => {
      // 중복 요청 방지를 위한 고유 키 생성
      const requestKey = `refund_${data.sessionEnrollmentId}`;

      // 이미 진행 중인 요청이 있는지 확인
      if (pendingRequests.current.has(requestKey)) {
        throw new Error("이미 환불 요청이 진행 중입니다.");
      }

      // 요청 시작 표시
      pendingRequests.current.add(requestKey);

      // 낙관적 업데이트를 위한 임시 환불 요청 생성
      const optimisticCancellation: Omit<CancellationHistory, "id"> & {
        id: string;
        isOptimistic: boolean;
      } = {
        id: `temp_${Date.now()}`,
        sessionId: data.sessionEnrollmentId,
        className: "환불 요청 중...",
        teacherName: "선생님",
        sessionDate: new Date().toISOString().split("T")[0],
        sessionTime: "09:00-10:00",
        refundAmount: data.refundAmount || 0,
        status: "REFUND_REQUESTED" as const,
        reason: data.reason,
        detailedReason: data.detailedReason,
        requestedAt: new Date().toISOString(),
        isOptimistic: true,
      };

      try {
        // 1. 낙관적 업데이트 (즉시 UI에 반영)
        dispatch(addOptimisticCancellation(optimisticCancellation));

        toast.success("환불 요청을 처리하고 있습니다...", {
          description: "잠시만 기다려주세요.",
        });

        // 2. API 호출
        const res = await refundApi.createRefundRequest(data);

        if (res.data && res.data.id) {
          // 3. 실제 데이터로 교체
          const refundData = res.data; // ResponseInterceptor가 래핑한 data

          const realCancellation: CancellationHistory = {
            id: refundData.id,
            sessionId: refundData.sessionEnrollmentId,
            className:
              refundData.sessionEnrollment?.session?.class?.className ||
              "클래스명",
            teacherName:
              refundData.sessionEnrollment?.session?.class?.teacher?.name ||
              "선생님",
            sessionDate:
              refundData.sessionEnrollment?.session?.date ||
              new Date().toISOString().split("T")[0],
            sessionTime: `${
              refundData.sessionEnrollment?.session?.startTime || "09:00"
            }-${refundData.sessionEnrollment?.session?.endTime || "10:00"}`,
            refundAmount: refundData.refundAmount,
            status: refundData.status as
              | "REFUND_REQUESTED"
              | "APPROVED"
              | "REJECTED",
            reason: refundData.reason,
            detailedReason: refundData.detailedReason,
            requestedAt: refundData.requestedAt,
            processedAt: refundData.processedAt,
            cancelledAt: refundData.cancelledAt,
          };

          dispatch(
            replaceOptimisticCancellation({
              optimisticId: optimisticCancellation.id,
              realCancellation: realCancellation, // isOptimistic 제거, 실제 데이터만 사용
            })
          );

          toast.success("환불 요청이 완료되었습니다!", {
            description: "승인 대기 중입니다.",
          });

          // 요청 완료 시 pendingRequests에서 제거
          pendingRequests.current.delete(requestKey);

          return res.data;
        } else {
          throw new Error("환불 요청 처리에 실패했습니다.");
        }
      } catch (err) {
        console.error("❌ [환불 요청] 에러 발생:", err);
        console.error("❌ [환불 요청] 에러 타입:", typeof err);
        console.error(
          "❌ [환불 요청] 에러 메시지:",
          err instanceof Error ? err.message : String(err)
        );
        console.error(
          "❌ [환불 요청] 에러 스택:",
          err instanceof Error ? err.stack : "No stack trace"
        );

        // 4. 실패 시 낙관적 업데이트 롤백
        console.log("🔄 [환불 요청] 낙관적 업데이트 롤백 시작");
        dispatch(removeOptimisticCancellation(optimisticCancellation.id));
        console.log("✅ [환불 요청] 낙관적 업데이트 롤백 완료");

        // 에러 발생 시에도 pendingRequests에서 제거
        pendingRequests.current.delete(requestKey);

        const errorMessage =
          err instanceof Error ? err.message : "환불 요청 생성에 실패했습니다.";

        setError(errorMessage);

        toast.error(extractErrorMessage(err, "환불 요청에 실패했습니다."));
        throw err;
      }
    },
    [dispatch]
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
    async (profileData: UpdateStudentProfileRequest) => {
      try {
        const sanitized: Record<string, unknown> = {};
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

  // 선생님 프로필 조회 (학생용)
  const getTeacherProfileForStudent = useCallback(async (teacherId: number) => {
    try {
      const response = await getTeacherProfile(teacherId);
      return response.data;
    } catch (err) {
      console.error("선생님 프로필 조회 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "선생님 프로필을 불러오는데 실패했습니다."
      );
      throw err;
    }
  }, []);

  // 캘린더용 세션 데이터 변환 (ConnectedCalendar에서 사용)
  const convertedSessions = useMemo(() => {
    if (!sessionClasses || sessionClasses.length === 0) {
      return [];
    }

    return sessionClasses.map((session: ClassSessionForEnrollment) => ({
      id: session.id,
      classId: session.id, // classId가 없으므로 id 사용
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      currentStudents: session.currentEnrollments || 0,
      maxStudents: session.maxStudents || 0,
      isEnrollable: false, // student-view에서는 선택 불가
      isFull: session.currentEnrollments >= session.maxStudents,
      isPastStartTime:
        new Date(session.date + " " + session.startTime) < new Date(),
      isAlreadyEnrolled: true, // 이미 수강 중인 세션
      studentEnrollmentStatus: "CONFIRMED",
      class: {
        id: session.id,
        className: session.className || "클래스",
        level: "BEGINNER", // 기본값 사용
        tuitionFee: session.tuitionFee?.toString() || "50000",
        teacher: {
          id: 0, // 기본값 사용
          name: session.teacherName || "선생님",
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

    // 선생님 프로필
    getTeacherProfileForStudent,
  };
}
