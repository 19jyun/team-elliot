"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDashboardNavigation } from "@/contexts/DashboardContext";

export type FocusType = "dashboard" | "modal" | "subpage" | "overlay";

interface FocusManagerOptions {
  focusType: FocusType;
  autoRestore?: boolean; // 컴포넌트 언마운트 시 자동으로 dashboard로 복원할지 여부
  restoreOnClose?: boolean; // 닫기 시 자동으로 dashboard로 복원할지 여부
}

export function useFocusManager(options: FocusManagerOptions) {
  const { pushFocus, popFocus, isDashboardFocused } = useDashboardNavigation();
  const { focusType, autoRestore = true, restoreOnClose = true } = options;
  const previousFocusRef = useRef<FocusType>("dashboard");

  // 포커스 설정
  const setCurrentFocus = useCallback(() => {
    previousFocusRef.current = isDashboardFocused() ? "dashboard" : "modal";
    pushFocus(focusType);
  }, [focusType, pushFocus, isDashboardFocused]);

  // 이전 포커스로 복원
  const restoreFocus = useCallback(() => {
    if (restoreOnClose) {
      popFocus();
    }
  }, [restoreOnClose, popFocus]);

  // 컴포넌트 마운트 시 포커스 설정
  useEffect(() => {
    setCurrentFocus();

    // 컴포넌트 언마운트 시 자동 복원
    if (autoRestore) {
      return () => {
        popFocus();
      };
    }
  }, [setCurrentFocus, autoRestore, popFocus]);

  return {
    setCurrentFocus,
    restoreFocus,
    isDashboardFocused,
  };
}

// 모달 전용 포커스 관리 훅
export function useModalFocus() {
  return useFocusManager({
    focusType: "modal",
    autoRestore: true,
    restoreOnClose: true,
  });
}

// 서브페이지 전용 포커스 관리 훅
export function useSubPageFocus() {
  return useFocusManager({
    focusType: "subpage",
    autoRestore: true,
    restoreOnClose: false, // 서브페이지는 수동으로 닫아야 함
  });
}

// 오버레이 전용 포커스 관리 훅
export function useOverlayFocus() {
  return useFocusManager({
    focusType: "overlay",
    autoRestore: true,
    restoreOnClose: true,
  });
}
