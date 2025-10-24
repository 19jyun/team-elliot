import {
  createEvent,
  modifyEvent,
  deleteEvent,
  checkAllPermissions,
  requestAllPermissions,
  listCalendars,
} from "@/capacitor/calendar/calendarService";
import { calendarIdMapper } from "./calendarIdMapper";
import {
  parseSessionDateTime,
  logKoreanTimezoneConversion,
} from "../utils/timezoneUtils";
import type { ClassSession } from "@/types/api/class";
import type { PrincipalClassSession } from "@/types/api/principal";
import type { TeacherSession } from "@/types/api/teacher";
import type {
  CalendarInfo,
  CalendarPermissions,
} from "@/types/calendar/CalendarInfo";

// 이벤트 관련 타입 정의
interface StoredEvent {
  id?: string;
  title: string;
  startDate: number;
  endDate: number;
  description?: string;
  calendarId?: string;
  createdAt: string;
}

interface CalendarEvent {
  title: string;
  startDate: number;
  endDate: number;
  description?: string;
  location?: string;
  isAllDay?: boolean;
  calendarId?: string;
}

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

      const hasPermission =
        result.readCalendar === "granted" && result.writeCalendar === "granted";

      return hasPermission;
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

  // 세션을 기기 캘린더 이벤트로 변환 (Capacitor Calendar CreateEventOptions 타입)
  private sessionToCalendarEvent(
    session: UnifiedCalendarSession
  ): CalendarEvent {
    // 날짜와 시간이 유효한지 확인
    if (!session.date || !session.startTime || !session.endTime) {
      console.error("❌ 세션 데이터가 불완전합니다:", {
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
      });

      // 세션 데이터 구조를 더 자세히 분석
      console.error("❌ 전체 세션 객체:", JSON.stringify(session, null, 2));

      // 가능한 대안 필드들 확인
      const alternativeFields = [
        "sessionDate",
        "classDate",
        "startDate",
        "endDate",
        "time",
        "start",
        "end",
      ];
      for (const field of alternativeFields) {
        if (session[field as keyof typeof session]) {
          console.log(
            `📅 대안 필드 발견: ${field} =`,
            session[field as keyof typeof session]
          );
        }
      }

      throw new Error("세션 데이터가 불완전합니다");
    }

    // 시간대 변환 유틸리티를 사용하여 날짜/시간 파싱
    const { startDate, endDate } = parseSessionDateTime(session);

    // 한국 시간대 변환 결과 로그 출력
    logKoreanTimezoneConversion(startDate, endDate);

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

    // 세션 ID 추가 (중복 체크를 위해)
    notes.push(`세션 ID: ${session.id}`);

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
        return false;
      }

      if (!this.syncStatus.isEnabled) {
        return false;
      }

      // 권한 재확인
      const hasPermission = await this.checkPermissions();

      if (!hasPermission) {
        console.error("❌ 캘린더 권한이 없습니다. 권한을 다시 요청합니다.");
        const granted = await this.requestPermissions();

        if (!granted) {
          this.syncStatus.error =
            "캘린더 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.";
          return false;
        }
      }

      const event = this.sessionToCalendarEvent(session);

      // 세션 ID 추출
      const sessionId = this.extractSessionId(event);

      // 기존 이벤트 확인 및 처리
      if (sessionId) {
        const existingNativeId = calendarIdMapper.getNativeId(sessionId);
        if (existingNativeId) {
          // 기존 이벤트 수정
          const modifyResult = await this.modifyExistingEvent(
            event,
            existingNativeId
          );
          if (modifyResult) {
            return true;
          }
        }
      }

      // 중복 이벤트 체크
      const isDuplicate = await this.checkDuplicateEvent(event, "default");
      if (isDuplicate) {
        return true;
      }

      // 사용 가능한 캘린더 목록 확인
      try {
        const calendars = await listCalendars();
        if (!calendars || calendars.length === 0) {
          delete event.calendarId;
        } else {
          const defaultCalendar =
            calendars.find((cal) => "isPrimary" in cal && cal.isPrimary) ||
            calendars[0];

          if (defaultCalendar) {
            event.calendarId = defaultCalendar.id;
            if ("source" in defaultCalendar && defaultCalendar.source) {
              (event as unknown as Record<string, unknown>).source =
                defaultCalendar.source;
            }
          } else {
            delete event.calendarId;
          }
        }
      } catch (calendarError) {
        delete event.calendarId;
      }

      // 이벤트 생성 (재시도 로직 포함)
      let result;
      let createEventSuccess = false;
      const maxRetries = 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          result = await createEvent(event);

          // 결과가 유효한지 확인
          if (
            result &&
            (typeof result === "object" || typeof result === "string")
          ) {
            createEventSuccess = true;
            break;
          }
        } catch (error) {
          // 재시도
        }

        // 마지막 시도가 아니면 잠시 대기
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!createEventSuccess) {
        throw new Error("이벤트 생성 3회 시도 후 실패");
      }

      // 네이티브 이벤트 ID 추출
      let nativeEventId: string | null = null;

      if (result && typeof result === "object" && "id" in result) {
        nativeEventId = result.id;
        this.storeEvent(event);
      } else {
        throw new Error("이벤트 생성 결과가 예상과 다름");
      }

      if (nativeEventId) {
        // [핵심] 앱 ID와 네이티브 ID를 매핑하여 저장
        calendarIdMapper.setMapping(session.id.toString(), nativeEventId);
        this.syncStatus.error = null;
        return true;
      } else {
        console.error(
          "❌ Failed to retrieve event Id - createEvent 반환값 분석:"
        );
        console.error("📅 원본 result:", result);
        console.error("📅 result 타입:", typeof result);
        console.error("📅 result 구조:", JSON.stringify(result, null, 2));
        throw new Error(
          "Failed to retrieve event Id - createEvent가 유효한 ID를 반환하지 않았습니다."
        );
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
        return false;
      }

      if (!this.syncStatus.isEnabled) {
        return false;
      }

      // [핵심] 앱 ID로 저장된 네이티브 ID를 조회
      const nativeEventId = calendarIdMapper.getNativeId(sessionId);

      if (!nativeEventId) {
        return true; // 이미 없으므로 성공으로 간주
      }

      // [핵심] 네이티브 ID로 삭제 요청
      await deleteEvent(nativeEventId);

      // 매핑 정보 제거
      calendarIdMapper.removeMapping(sessionId);

      // localStorage에서도 해당 이벤트 제거
      this.removeStoredEvent(sessionId);

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
        return false;
      }

      if (!this.syncStatus.isEnabled) {
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
    this.userSettings.isUserEnabled = enabled;
    this.saveUserSettings();
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

  /**
   * 사용 가능한 캘린더 목록 조회 (UI용)
   * @returns 캘린더 목록
   */
  async getAvailableCalendars(): Promise<CalendarInfo[]> {
    try {
      const calendars = await listCalendars();

      // CalendarInfo 타입으로 변환
      const calendarInfos: CalendarInfo[] = calendars.map((cal) => ({
        id: cal.id,
        title: cal.title,
        internalTitle: cal.internalTitle,
        color: cal.color,
        accountName: cal.accountName,
        ownerAccount: cal.ownerAccount,
        maxReminders: cal.maxReminders,
        visible: cal.visible,
        isPrimary:
          cal.accountName?.includes("@") && cal.ownerAccount?.includes("@"),
      }));

      return calendarInfos;
    } catch (error) {
      console.error("❌ 캘린더 목록 조회 실패:", error);
      throw new Error(
        `캘린더 목록을 불러올 수 없습니다: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 캘린더 권한 확인
   * @returns 권한 상태
   */
  async checkCalendarPermissions(): Promise<CalendarPermissions> {
    try {
      const permissions = await checkAllPermissions();

      return {
        readCalendar: permissions.readCalendar,
        writeCalendar: permissions.writeCalendar,
        readReminders: permissions.readReminders,
        writeReminders: permissions.writeReminders,
      };
    } catch (error) {
      console.error("❌ 권한 확인 실패:", error);
      throw new Error(
        `권한을 확인할 수 없습니다: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 캘린더 권한 요청
   * @returns 권한 요청 결과
   */
  async requestCalendarPermissions(): Promise<CalendarPermissions> {
    try {
      const permissions = await requestAllPermissions();

      return {
        readCalendar: permissions.readCalendar,
        writeCalendar: permissions.writeCalendar,
        readReminders: permissions.readReminders,
        writeReminders: permissions.writeReminders,
      };
    } catch (error) {
      console.error("❌ 권한 요청 실패:", error);
      throw new Error(
        `권한 요청에 실패했습니다: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 사용자 선택한 캘린더 저장
   * @param calendarId 선택된 캘린더 ID
   */
  async saveSelectedCalendar(calendarId: string): Promise<void> {
    try {
      // 선택된 캘린더가 유효한지 확인
      const calendars = await this.getAvailableCalendars();
      const selectedCalendar = calendars.find((cal) => cal.id === calendarId);

      if (!selectedCalendar) {
        throw new Error(`선택된 캘린더를 찾을 수 없습니다: ${calendarId}`);
      }

      // localStorage에 저장
      localStorage.setItem("selectedCalendarId", calendarId);
    } catch (error) {
      console.error("❌ 캘린더 선택 저장 실패:", error);
      throw error;
    }
  }

  /**
   * 저장된 캘린더 ID 조회
   * @returns 저장된 캘린더 ID 또는 null
   */
  getStoredCalendarId(): string | null {
    return localStorage.getItem("selectedCalendarId");
  }

  /**
   * 선택된 캘린더 정보 조회
   * @returns 선택된 캘린더 정보 또는 null
   */
  async getSelectedCalendarInfo(): Promise<CalendarInfo | null> {
    try {
      const storedId = this.getStoredCalendarId();
      if (!storedId) return null;

      const calendars = await this.getAvailableCalendars();
      return calendars.find((cal) => cal.id === storedId) || null;
    } catch (error) {
      console.error("❌ 선택된 캘린더 정보 조회 실패:", error);
      return null;
    }
  }

  /**
   * 중복 이벤트 체크
   * @param event 이벤트 데이터
   * @param calendarId 캘린더 ID
   * @returns 중복 여부
   */
  private async checkDuplicateEvent(
    event: CalendarEvent,
    _calendarId: string
  ): Promise<boolean> {
    try {
      // 1차: localStorage 기반 중복 체크
      const isLocalDuplicate = this.checkLocalStorageDuplicate(event);
      if (isLocalDuplicate) {
        return true;
      }

      // 2차: calendarIdMapper 기반 중복 체크
      const isMapperDuplicate = this.checkMapperDuplicate(event);
      if (isMapperDuplicate) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ 중복 이벤트 체크 실패:", error);
      return false; // 에러 시 중복이 아닌 것으로 처리
    }
  }

  /**
   * localStorage 기반 중복 체크
   */
  private checkLocalStorageDuplicate(event: CalendarEvent): boolean {
    const existingEvents = this.getStoredEvents();
    const eventTitle = event.title;
    const eventStartTime = event.startDate;
    const eventEndTime = event.endDate;
    const eventDescription = event.description || "";
    const teacherName = this.extractTeacherName(eventDescription);

    for (const existingEvent of existingEvents) {
      const isTitleMatch = existingEvent.title === eventTitle;
      const isTimeMatch =
        existingEvent.startDate === eventStartTime &&
        existingEvent.endDate === eventEndTime;
      const isTeacherMatch =
        this.extractTeacherName(existingEvent.description || "") ===
        teacherName;

      if (isTitleMatch && isTimeMatch && isTeacherMatch) {
        return true;
      }
    }
    return false;
  }

  /**
   * calendarIdMapper 기반 중복 체크
   */
  private checkMapperDuplicate(event: CalendarEvent): boolean {
    try {
      // 세션 ID 추출 (description에서 추출)
      const sessionId = this.extractSessionId(event);
      if (!sessionId) {
        return false;
      }

      // 해당 세션 ID로 이미 네이티브 이벤트가 생성되었는지 확인
      const existingNativeId = calendarIdMapper.getNativeId(sessionId);
      if (existingNativeId) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ calendarIdMapper 중복 체크 실패:", error);
      return false;
    }
  }

  /**
   * 기존 이벤트 수정
   */
  private async modifyExistingEvent(
    event: CalendarEvent,
    nativeEventId: string
  ): Promise<boolean> {
    try {
      // modifyEvent 호출
      const result = await modifyEvent({
        id: nativeEventId,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description,
        location: event.location,
        isAllDay: event.isAllDay,
        calendarId: event.calendarId,
      });

      // modifyEvent는 void를 반환하므로 성공으로 간주
      return true;
    } catch (error) {
      console.error("❌ 기존 이벤트 수정 실패:", error);
      return false;
    }
  }

  /**
   * 이벤트에서 세션 ID 추출
   */
  private extractSessionId(event: CalendarEvent): string | null {
    try {
      // description에서 세션 ID 추출 시도
      if (event.description) {
        // "세션 ID: 123" 또는 "Session ID: 123" 패턴 찾기
        const sessionIdMatch = event.description.match(
          /(?:세션\s*ID|Session\s*ID)[:\s]*(\d+)/i
        );
        if (sessionIdMatch && sessionIdMatch[1]) {
          return sessionIdMatch[1];
        }

        // "ID: 123" 패턴 찾기
        const idMatch = event.description.match(/ID[:\s]*(\d+)/i);
        if (idMatch && idMatch[1]) {
          return idMatch[1];
        }
      }

      // title에서 세션 ID 추출 시도
      if (event.title) {
        const titleIdMatch = event.title.match(/(\d+)/);
        if (titleIdMatch && titleIdMatch[1]) {
          return titleIdMatch[1];
        }
      }

      return null;
    } catch (error) {
      console.error("❌ 세션 ID 추출 실패:", error);
      return null;
    }
  }

  /**
   * 저장된 이벤트 목록 조회
   * @returns 저장된 이벤트 목록
   */
  private getStoredEvents(): StoredEvent[] {
    try {
      const stored = localStorage.getItem("calendarEvents");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("❌ 저장된 이벤트 조회 실패:", error);
      return [];
    }
  }

  /**
   * 이벤트 저장
   * @param event 저장할 이벤트
   */
  private storeEvent(event: CalendarEvent): void {
    try {
      const existingEvents = this.getStoredEvents();
      existingEvents.push({
        ...event,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("calendarEvents", JSON.stringify(existingEvents));
    } catch (error) {
      console.error("❌ 이벤트 저장 실패:", error);
    }
  }

  /**
   * 저장된 이벤트 제거
   * @param sessionId 세션 ID
   */
  private removeStoredEvent(sessionId: string): void {
    try {
      const existingEvents = this.getStoredEvents();
      const filteredEvents = existingEvents.filter((event) => {
        // 세션 ID가 description에 포함된 이벤트 제거
        if (
          event.description &&
          event.description.includes(`세션 ID: ${sessionId}`)
        ) {
          return false;
        }
        return true;
      });

      localStorage.setItem("calendarEvents", JSON.stringify(filteredEvents));
    } catch (error) {
      console.error("❌ localStorage 이벤트 제거 실패:", error);
    }
  }

  /**
   * description에서 선생님 이름 추출
   * @param description 이벤트 설명
   * @returns 선생님 이름
   */
  private extractTeacherName(description: string): string {
    try {
      // "선생님: 이강사" 또는 "Teacher: 이강사" 패턴 찾기
      const teacherMatch = description.match(
        /(?:선생님|Teacher)[:\s]*([^\n\r]+)/i
      );
      if (teacherMatch && teacherMatch[1]) {
        return teacherMatch[1].trim();
      }

      // "이강사" 패턴 직접 찾기 (한글 이름)
      const nameMatch = description.match(
        /([가-힣]{2,4})\s*(?:선생님|Teacher)/i
      );
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }

      return "";
    } catch (error) {
      console.error("❌ 선생님 이름 추출 실패:", error);
      return "";
    }
  }
}

// 싱글톤 인스턴스 생성
export const calendarSyncService = new CalendarSyncService();
