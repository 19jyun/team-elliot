import {
  createEvent,
  modifyEvent,
  deleteEvent,
  checkAllPermissions,
  requestAllPermissions,
} from "@/capacitor/calendar/calendarService";
import { calendarIdMapper } from "./calendarIdMapper";
import type { ClassSession } from "@/types/api/class";
import type { PrincipalClassSession } from "@/types/api/principal";
import type { TeacherSession } from "@/types/api/teacher";

// 통합된 캘린더 세션 타입
export type UnifiedCalendarSession =
  | ClassSession
  | PrincipalClassSession
  | TeacherSession;

// 캘린더 동기화 상태
export interface SyncStatus {
  isEnabled: boolean;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
  error: string | null;
}

// 캘린더 동기화 서비스
class CalendarSyncService {
  private syncStatus: SyncStatus = {
    isEnabled: false,
    lastSyncTime: null,
    syncInProgress: false,
    error: null,
  };

  // 사용자 설정 상태 관리
  private userSettings = {
    isUserEnabled: false,
    hasRequestedPermission: false,
  };

  constructor() {
    // Capacitor 플러그인은 calendarService에서 관리
    // 로컬 스토리지에서 사용자 설정 로드
    this.loadUserSettings();
  }

  // 사용자 설정 로드
  private loadUserSettings(): void {
    try {
      const stored = localStorage.getItem("calendarSyncSettings");
      if (stored) {
        const settings = JSON.parse(stored);
        this.userSettings = {
          isUserEnabled: settings.isUserEnabled || false,
          hasRequestedPermission: settings.hasRequestedPermission || false,
        };
        this.syncStatus.isEnabled = this.userSettings.isUserEnabled;
      }
    } catch (error) {
      console.error("사용자 설정 로드 실패:", error);
    }
  }

  // 사용자 설정 저장
  private saveUserSettings(): void {
    try {
      localStorage.setItem(
        "calendarSyncSettings",
        JSON.stringify(this.userSettings)
      );
    } catch (error) {
      console.error("사용자 설정 저장 실패:", error);
    }
  }

  // 사용자가 설정에서 활성화했는지 확인
  isUserEnabled(): boolean {
    return this.userSettings.isUserEnabled;
  }

  // 사용자가 권한을 요청했는지 확인
  hasUserRequestedPermission(): boolean {
    return this.userSettings.hasRequestedPermission;
  }

  // 사용자 설정에서 동기화 활성화/비활성화
  setUserEnabled(enabled: boolean): void {
    this.userSettings.isUserEnabled = enabled;
    this.syncStatus.isEnabled = enabled;
    this.saveUserSettings();

    if (!enabled) {
      // 비활성화 시 에러 초기화
      this.syncStatus.error = null;
    }
  }

  // 권한 확인
  async checkPermissions(): Promise<boolean> {
    try {
      const result = await checkAllPermissions();
      return (
        result.readCalendar === "granted" && result.writeCalendar === "granted"
      );
    } catch (error) {
      console.error("캘린더 권한 확인 실패:", error);
      return false;
    }
  }

  // 권한 요청
  async requestPermissions(): Promise<boolean> {
    try {
      const result = await requestAllPermissions();
      const granted =
        result.readCalendar === "granted" && result.writeCalendar === "granted";

      // 권한 요청 시도 기록
      this.userSettings.hasRequestedPermission = true;
      this.saveUserSettings();

      return granted;
    } catch (error) {
      console.error("캘린더 권한 요청 실패:", error);
      return false;
    }
  }

  // 세션을 기기 캘린더 이벤트로 변환
  private sessionToCalendarEvent(session: UnifiedCalendarSession): {
    title: string;
    calendarId?: string;
    location?: string;
    startDate: number;
    endDate: number;
    isAllDay?: boolean;
    description?: string;
  } {
    const startDate = new Date(`${session.date}T${session.startTime}`);
    const endDate = new Date(`${session.date}T${session.endTime}`);

    return {
      title: this.getSessionTitle(session),
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
      description: this.getSessionNotes(session),
      location: this.getSessionLocation(session),
      isAllDay: false,
    };
  }

  // 세션 제목 생성
  private getSessionTitle(session: UnifiedCalendarSession): string {
    if ("class" in session && session.class) {
      const teacherName =
        "teacher" in session.class && session.class.teacher
          ? typeof session.class.teacher === "string"
            ? session.class.teacher
            : session.class.teacher.name
          : "선생님";
      return `${session.class.className} - ${teacherName}`;
    }
    if ("className" in session) {
      return String(session.className);
    }
    return "수업";
  }

  // 세션 노트 생성
  private getSessionNotes(session: UnifiedCalendarSession): string {
    const notes = [];

    if ("class" in session && session.class) {
      notes.push(`레벨: ${session.class.level}`);
      if ("tuitionFee" in session.class) {
        notes.push(`수강료: ${session.class.tuitionFee}원`);
      }
    }

    if ("currentStudents" in session && "maxStudents" in session) {
      notes.push(`수강생: ${session.currentStudents}/${session.maxStudents}명`);
    }

    return notes.join("\n");
  }

  // 세션 위치 생성
  private getSessionLocation(session: UnifiedCalendarSession): string {
    if ("class" in session && session.class) {
      return "location" in session.class
        ? String(session.class.location || "학원")
        : "학원";
    }
    return "학원";
  }

  // 기기 캘린더에 세션 추가
  async addSessionToDevice(session: UnifiedCalendarSession): Promise<boolean> {
    try {
      // 사용자 설정 확인
      if (!this.isUserEnabled()) {
        console.log("사용자가 캘린더 동기화를 비활성화했습니다.");
        return false;
      }

      if (!this.syncStatus.isEnabled) {
        console.log("캘린더 동기화가 비활성화되어 있습니다.");
        return false;
      }

      // 권한 재확인
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        this.syncStatus.error = "캘린더 권한이 없습니다.";
        return false;
      }

      const event = this.sessionToCalendarEvent(session);

      // createEvent가 반환하는 네이티브 ID를 받음
      // (플러그인 반환값이 { eventId: string } 형태라고 가정)
      // 만약 { result: string } 형태라면 result를 사용하세요.
      const { id: nativeEventId } = await createEvent(event);

      if (nativeEventId) {
        // [핵심] 앱 ID와 네이티브 ID를 매핑하여 저장
        calendarIdMapper.setMapping(session.id.toString(), nativeEventId);
        console.log(
          "세션 추가 및 ID 매핑 성공:",
          session.id,
          "->",
          nativeEventId
        );
        this.syncStatus.error = null;
        return true;
      } else {
        throw new Error("네이티브 이벤트 ID를 반환받지 못했습니다.");
      }
    } catch (error) {
      console.error("기기 캘린더에 세션 추가 실패:", error);
      this.syncStatus.error = `세션 추가 실패: ${
        error instanceof Error ? error.message : String(error)
      }`;
      return false;
    }
  }

  // 기기 캘린더에서 세션 제거
  async removeSessionFromDevice(sessionId: string): Promise<boolean> {
    try {
      // 사용자 설정 확인
      if (!this.isUserEnabled()) {
        console.log("사용자가 캘린더 동기화를 비활성화했습니다.");
        return false;
      }

      if (!this.syncStatus.isEnabled) {
        console.log("캘린더 동기화가 비활성화되어 있습니다.");
        return false;
      }

      // [핵심] 앱 ID로 저장된 네이티브 ID를 조회
      const nativeEventId = calendarIdMapper.getNativeId(sessionId);

      if (!nativeEventId) {
        console.log("매핑된 네이티브 ID가 없어 삭제를 건너뜁니다:", sessionId);
        return true; // 이미 없으므로 성공으로 간주
      }

      // [핵심] 네이티브 ID로 삭제 요청
      await deleteEvent(nativeEventId);

      // 매핑 정보 제거
      calendarIdMapper.removeMapping(sessionId);
      console.log("기기 캘린더에서 세션 제거 성공:", nativeEventId);
      return true;
    } catch (error) {
      console.error("기기 캘린더에서 세션 제거 실패:", error);
      this.syncStatus.error = `세션 제거 실패: ${error}`;
      return false;
    }
  }

  // 기기 캘린더에서 세션 업데이트
  async updateSessionInDevice(
    session: UnifiedCalendarSession
  ): Promise<boolean> {
    try {
      // 사용자 설정 확인
      if (!this.isUserEnabled()) {
        console.log("사용자가 캘린더 동기화를 비활성화했습니다.");
        return false;
      }

      if (!this.syncStatus.isEnabled) {
        console.log("캘린더 동기화가 비활성화되어 있습니다.");
        return false;
      }

      // 권한 재확인
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        this.syncStatus.error = "캘린더 권한이 없습니다.";
        return false;
      }

      // [핵심] 앱 ID로 저장된 네이티브 ID를 조회
      const nativeEventId = calendarIdMapper.getNativeId(session.id.toString());

      if (!nativeEventId) {
        console.warn(
          "업데이트할 네이티브 ID가 없습니다. 새로 추가합니다.",
          session.id
        );
        // ID가 없으면 '추가' 로직을 대신 실행
        return this.addSessionToDevice(session);
      }

      const event = this.sessionToCalendarEvent(session);

      // [핵심] 네이티브 ID로 수정 요청
      await modifyEvent({
        id: nativeEventId,
        ...event,
      });

      console.log("기기 캘린더에서 세션 업데이트 성공:", nativeEventId);
      this.syncStatus.error = null;
      return true;
    } catch (error) {
      console.error("기기 캘린더에서 세션 업데이트 실패:", error);
      this.syncStatus.error = `세션 업데이트 실패: ${error}`;
      return false;
    }
  }

  // 모든 세션을 기기 캘린더에 동기화
  async syncSessionsToDevice(
    sessions: UnifiedCalendarSession[]
  ): Promise<boolean> {
    try {
      // 사용자 설정 확인
      if (!this.isUserEnabled()) {
        console.log("사용자가 캘린더 동기화를 비활성화했습니다.");
        return false;
      }

      this.syncStatus.syncInProgress = true;
      this.syncStatus.error = null;

      // 권한 확인
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          this.syncStatus.error = "캘린더 권한이 필요합니다.";
          return false;
        }
      }

      // 각 세션을 기기 캘린더에 추가
      for (const session of sessions) {
        await this.addSessionToDevice(session);
      }

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.isEnabled = true;
      console.log("캘린더 동기화 완료:", sessions.length, "개 세션");
      return true;
    } catch (error) {
      console.error("캘린더 동기화 실패:", error);
      this.syncStatus.error = `동기화 실패: ${error}`;
      return false;
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  // 동기화 상태 가져오기
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // 동기화 활성화/비활성화
  setSyncEnabled(enabled: boolean): void {
    this.syncStatus.isEnabled = enabled;
    if (!enabled) {
      this.syncStatus.error = null;
    }
  }

  // 에러 초기화
  clearError(): void {
    this.syncStatus.error = null;
  }

  // 재시도 로직이 있는 세션 추가
  async addSessionToDeviceWithRetry(
    session: UnifiedCalendarSession,
    maxRetries: number = 3
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const success = await this.addSessionToDevice(session);
        if (success) {
          return true;
        }

        if (attempt < maxRetries) {
          console.log(`세션 추가 재시도 ${attempt}/${maxRetries}:`, session.id);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // 지수 백오프
        }
      } catch (error) {
        console.error(`세션 추가 시도 ${attempt} 실패:`, error);
        if (attempt === maxRetries) {
          this.syncStatus.error = `세션 추가 실패 (${maxRetries}회 시도): ${
            error instanceof Error ? error.message : String(error)
          }`;
        }
      }
    }
    return false;
  }

  // 재시도 로직이 있는 전체 동기화
  async syncSessionsToDeviceWithRetry(
    sessions: UnifiedCalendarSession[],
    maxRetries: number = 3
  ): Promise<boolean> {
    try {
      this.syncStatus.syncInProgress = true;
      this.syncStatus.error = null;

      // 권한 확인
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          this.syncStatus.error = "캘린더 권한이 필요합니다.";
          return false;
        }
      }

      // 각 세션을 재시도 로직과 함께 추가
      let successCount = 0;
      for (const session of sessions) {
        const success = await this.addSessionToDeviceWithRetry(
          session,
          maxRetries
        );
        if (success) {
          successCount++;
        }
      }

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.isEnabled = true;

      if (successCount === sessions.length) {
        console.log("캘린더 동기화 완료:", sessions.length, "개 세션");
        return true;
      } else {
        console.warn(
          `캘린더 동기화 부분 성공: ${successCount}/${sessions.length}개 세션`
        );
        this.syncStatus.error = `일부 세션 동기화 실패: ${successCount}/${sessions.length}개 성공`;
        return false;
      }
    } catch (error) {
      console.error("캘린더 동기화 실패:", error);
      this.syncStatus.error = `동기화 실패: ${
        error instanceof Error ? error.message : String(error)
      }`;
      return false;
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }
}

// 싱글톤 인스턴스 생성
export const calendarSyncService = new CalendarSyncService();
