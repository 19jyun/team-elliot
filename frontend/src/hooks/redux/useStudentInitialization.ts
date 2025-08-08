import { useEffect } from "react";
import { useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useSession } from "next-auth/react";
import {
  setStudentData,
  setLoading,
  setError,
} from "@/store/slices/studentSlice";
import {
  getMyClasses,
  getMyProfile,
  getEnrollmentHistory,
  getCancellationHistory,
} from "@/api/student";
import { getMyAcademies } from "@/api/academy";
import { getStudentAvailableSessionsForEnrollment } from "@/api/class-sessions";
import { toast } from "sonner";

export function useStudentInitialization() {
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const initializedRef = useRef(false);

  useEffect(() => {
    const initializeStudentData = async () => {
      // 이미 초기화되었거나 Student 역할이 아니면 초기화하지 않음
      if (initializedRef.current) return;
      if (
        status !== "authenticated" ||
        !session?.user ||
        session.user.role !== "STUDENT"
      ) {
        return;
      }

      initializedRef.current = true;

      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        // 1. 수강중인 클래스/세션 정보
        const myClasses = await getMyClasses();

        // 2. 개인 정보
        const myProfile = await getMyProfile();

        // 3. 수강 신청/결제 내역
        const enrollmentHistory = await getEnrollmentHistory();

        // 4. 환불/취소 내역
        const cancellationHistory = await getCancellationHistory();

        // 5. 가입한 학원 목록 - 응답 데이터만 추출
        const academiesResponse = await getMyAcademies();
        const myAcademies = academiesResponse.data || []; // axios 응답에서 data만 추출

        // 6. 수강 가능한 클래스/세션 정보 (모든 학원)
        let allAvailableClasses: any[] = [];
        let allAvailableSessions: any[] = [];

        if (myAcademies.length > 0) {
          // 각 학원별로 수강 가능한 세션 조회
          for (const academy of myAcademies) {
            try {
              const availableData =
                await getStudentAvailableSessionsForEnrollment(academy.id);
              console.log(
                `✅ ${academy.name} 수강 가능한 세션 로드 완료:`,
                availableData
              );

              if (availableData.sessions && availableData.sessions.length > 0) {
                // 세션 데이터 추가
                allAvailableSessions.push(...availableData.sessions);

                // 클래스 데이터 추출 (중복 제거)
                const classMap = new Map();
                availableData.sessions.forEach((session: any) => {
                  if (session.class && !classMap.has(session.class.id)) {
                    classMap.set(session.class.id, {
                      ...session.class,
                      availableSessions: availableData.sessions.filter(
                        (s: any) => s.classId === session.class.id
                      ),
                    });
                  }
                });

                allAvailableClasses.push(...Array.from(classMap.values()));
              }
            } catch (error) {
              console.warn(
                `⚠️ ${academy.name} 수강 가능한 세션 로드 실패:`,
                error
              );
            }
          }

          console.log("수강 가능한 클래스/세션 로드 완료:", {
            classes: allAvailableClasses.length,
            sessions: allAvailableSessions.length,
          });
        }

        // Redux 상태 업데이트
        dispatch(
          setStudentData({
            userProfile: myProfile,
            academies: myAcademies, // 직렬화 가능한 데이터만 저장
            enrollmentClasses: myClasses.enrollmentClasses,
            sessionClasses: myClasses.sessionClasses,
            availableClasses: allAvailableClasses, // 수강 가능한 클래스 목록
            availableSessions: allAvailableSessions, // 수강 가능한 세션 목록
            enrollmentHistory,
            cancellationHistory,
            calendarRange: myClasses.calendarRange,
            enrollmentProgress: {
              currentStep: "academy-selection",
            },
          })
        );

        toast.success("Student 대시보드가 로드되었습니다.", {
          id: "student-init",
        });
      } catch (error: any) {
        console.error("❌ Student 데이터 초기화 실패:", error);

        const errorMessage =
          error.response?.data?.message || "데이터 로딩에 실패했습니다.";
        dispatch(setError(errorMessage));

        toast.error("Student 데이터 로딩 실패", {
          description: errorMessage,
          id: "student-init-error",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeStudentData();
  }, [dispatch, session, status]);

  return {
    isInitialized: status === "authenticated" && !!session?.user,
  };
}
