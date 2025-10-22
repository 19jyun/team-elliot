import {
  calendarSyncService,
  type UnifiedCalendarSession,
} from "@/services/calendarSyncService";
import type { RootState } from "@/store/index";

// 캘린더 관련 액션 타입들
const CALENDAR_ACTIONS = [
  // Student 캘린더 액션들
  "student/setCalendarSessions",
  "student/addCalendarSession",
  "student/updateCalendarSession",
  "student/removeCalendarSession",
  "student/addOptimisticCalendarSession",
  "student/replaceOptimisticCalendarSession",
  "student/removeOptimisticCalendarSession",
  "student/updateSessionInfoFromSocket",
  "student/addNewSessionFromSocket",

  // Principal 캘린더 액션들
  "principal/setCalendarSessions",
  "principal/addCalendarSession",
  "principal/updateCalendarSession",
  "principal/removeCalendarSession",
  "principal/updateSessionInfoFromSocket",
  "principal/addNewSessionFromSocket",

  // Teacher 캘린더 액션들
  "teacher/setCalendarSessions",
  "teacher/addCalendarSession",
  "teacher/updateCalendarSession",
  "teacher/removeCalendarSession",
  "teacher/updateSessionInfoFromSocket",
  "teacher/addNewSessionFromSocket",
];

// 캘린더 액션인지 확인
function isCalendarAction(action: {
  type: string;
  payload?: unknown;
}): boolean {
  return CALENDAR_ACTIONS.includes(action.type);
}

// 액션 타입에 따른 동기화 처리
async function handleCalendarAction(
  action: { type: string; payload?: unknown },
  state: RootState
) {
  const { type, payload } = action;

  try {
    // 권한 확인
    const hasPermission = await calendarSyncService.checkPermissions();
    if (!hasPermission) {
      console.log("캘린더 권한이 없어 동기화를 건너뜁니다.");
      return;
    }

    // 동기화가 비활성화된 경우
    if (!calendarSyncService.getSyncStatus().isEnabled) {
      console.log("캘린더 동기화가 비활성화되어 있습니다.");
      return;
    }

    // 액션별 처리
    switch (type) {
      case "student/setCalendarSessions":
      case "principal/setCalendarSessions":
      case "teacher/setCalendarSessions":
        // 전체 세션 동기화
        if (payload && Array.isArray(payload) && payload.length > 0) {
          await calendarSyncService.syncSessionsToDevice(
            payload as UnifiedCalendarSession[]
          );
        }
        break;

      case "student/addCalendarSession":
      case "principal/addCalendarSession":
      case "teacher/addCalendarSession":
        // 개별 세션 추가
        if (payload) {
          await calendarSyncService.addSessionToDevice(
            payload as UnifiedCalendarSession
          );
        }
        break;

      case "student/updateCalendarSession":
      case "principal/updateCalendarSession":
      case "teacher/updateCalendarSession":
        // 개별 세션 업데이트
        if (payload) {
          await calendarSyncService.updateSessionInDevice(
            payload as UnifiedCalendarSession
          );
        }
        break;

      case "student/removeCalendarSession":
      case "principal/removeCalendarSession":
      case "teacher/removeCalendarSession":
        // 개별 세션 제거
        if (payload) {
          await calendarSyncService.removeSessionFromDevice(payload.toString());
        }
        break;

      case "student/replaceOptimisticCalendarSession":
      case "principal/replaceOptimisticCalendarSession":
      case "teacher/replaceOptimisticCalendarSession":
        // 낙관적 업데이트 완료 시 실제 세션 추가
        if (
          payload &&
          typeof payload === "object" &&
          "realSession" in payload
        ) {
          await calendarSyncService.addSessionToDevice(
            (payload as { realSession: UnifiedCalendarSession }).realSession
          );
        }
        break;

      case "student/removeOptimisticCalendarSession":
      case "principal/removeOptimisticCalendarSession":
      case "teacher/removeOptimisticCalendarSession":
        // 낙관적 업데이트 취소 시 세션 제거
        if (payload) {
          await calendarSyncService.removeSessionFromDevice(payload.toString());
        }
        break;

      case "student/updateSessionInfoFromSocket":
      case "principal/updateSessionInfoFromSocket":
      case "teacher/updateSessionInfoFromSocket":
        // 소켓 이벤트로 세션 정보 업데이트
        if (
          payload &&
          typeof payload === "object" &&
          "sessionId" in payload &&
          "updates" in payload
        ) {
          const socketPayload = payload as {
            sessionId: number;
            updates: Record<string, unknown>;
          };
          // 현재 상태에서 해당 세션 찾아서 업데이트
          const currentSessions = getCurrentSessions(state, type.split("/")[0]);
          const session = currentSessions.find(
            (s: { id: number }) => s.id === socketPayload.sessionId
          );
          if (session) {
            const updatedSession = { ...session, ...socketPayload.updates };
            await calendarSyncService.updateSessionInDevice(
              updatedSession as UnifiedCalendarSession
            );
          }
        }
        break;

      case "student/addNewSessionFromSocket":
      case "principal/addNewSessionFromSocket":
      case "teacher/addNewSessionFromSocket":
        // 소켓 이벤트로 새 세션 추가
        if (payload) {
          await calendarSyncService.addSessionToDevice(
            payload as UnifiedCalendarSession
          );
        }
        break;

      default:
        console.log("처리되지 않은 캘린더 액션:", type);
    }
  } catch (error) {
    console.error("캘린더 동기화 미들웨어 에러:", error);
  }
}

// 현재 상태에서 세션 가져오기
function getCurrentSessions(
  state: RootState,
  role: string
): Array<{ id: number }> {
  switch (role) {
    case "student":
      return state.student.data?.calendarSessions || [];
    case "principal":
      return state.principal.data?.calendarSessions || [];
    case "teacher":
      return state.teacher.data?.calendarSessions || [];
    default:
      return [];
  }
}

// 캘린더 동기화 미들웨어
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calendarSyncMiddleware: any =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

    (store: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (next: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (action: any) => {
      const result = next(action);

      // 캘린더 관련 액션인지 확인
      if (isCalendarAction(action)) {
        // 비동기로 동기화 처리 (UI 블로킹 방지)
        handleCalendarAction(action, store.getState());
      }

      return result;
    };
