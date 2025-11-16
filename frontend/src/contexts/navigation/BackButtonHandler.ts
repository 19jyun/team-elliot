// src/contexts/navigation/BackButtonHandler.ts
import { GoBackManager } from "./GoBackManager";
import { NavigationState, FormsState } from "../state/StateSyncTypes";

/**
 * 뒤로가기 버튼 이벤트를 통합 처리하는 핸들러
 *
 * 책임:
 * - 브라우저와 Capacitor의 뒤로가기 이벤트를 단일 진입점으로 통합
 * - 중복 실행 방지
 * - GoBackManager에 뒤로가기 로직 위임
 *
 * 설계 원칙:
 * - Single Source of Truth: 모든 뒤로가기가 이 핸들러를 통해 처리
 * - Separation of Concerns: 이벤트 수집만 담당, 로직은 GoBackManager에 위임
 */
export class BackButtonHandler {
  private goBackManager: GoBackManager;
  private isHandling: boolean = false;

  constructor(goBackManager: GoBackManager) {
    this.goBackManager = goBackManager;
  }

  /**
   * 모든 뒤로가기 이벤트의 단일 진입점
   *
   * 브라우저의 popstate 이벤트와 Capacitor의 backButton 이벤트 모두
   * 이 메서드를 호출하여 일관된 처리를 보장합니다.
   *
   * @param canGoBack Capacitor에서 제공하는 히스토리 상태 (옵션)
   *                  웹뷰의 history 스택에 이전 페이지가 있는지 여부
   * @param navigationState 네비게이션 상태 (옵션, 전달 시 직접 사용)
   * @param formsState 폼 상태 (옵션, 전달 시 직접 사용)
   * @returns 뒤로가기 성공 여부
   */
  async handleBackButton(
    canGoBack?: boolean,
    navigationState?: NavigationState,
    formsState?: FormsState
  ): Promise<boolean> {
    // 중복 실행 방지: 이미 처리 중이면 스킵
    if (this.isHandling) {
      return false;
    }

    this.isHandling = true;

    try {
      // 상태가 전달되면 직접 사용, 없으면 StateSync에서 가져오기 시도
      let result;

      if (navigationState && formsState) {
        // 상태를 직접 전달하여 사용 (StateSync 의존성 제거)
        result = await this.goBackManager.executeGoBackWithState(
          navigationState,
          formsState
        );
      } else {
        // StateSync에서 상태 가져오기 시도 (fallback)
        result = await this.goBackManager.executeGoBack();
      }

      return result.success;
    } catch (error) {
      console.error(`[BackButtonHandler] 오류 발생`, error);
      return false;
    } finally {
      // 처리 완료 후 플래그 해제
      this.isHandling = false;
    }
  }
}
