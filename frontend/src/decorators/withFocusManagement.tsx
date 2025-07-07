'use client';

import React, { ComponentType, useEffect } from 'react';
import { useDashboardNavigation, FocusType } from '@/contexts/DashboardContext';

interface FocusManagementConfig {
  focusType: FocusType;
  autoRestore?: boolean;
  restoreOnClose?: boolean;
  onFocusChange?: (focus: FocusType) => void;
}

// 포커스 관리 데코레이터
export function withFocusManagement<P extends object>(
  WrappedComponent: ComponentType<P>,
  config: FocusManagementConfig
) {
  const {
    focusType,
    autoRestore = true,
    restoreOnClose = true,
    onFocusChange,
  } = config;

  return function FocusManagedComponent(props: P) {
    const { pushFocus, popFocus, currentFocus } = useDashboardNavigation();

    // 컴포넌트 마운트 시 포커스 설정
    useEffect(() => {
      pushFocus(focusType);
      onFocusChange?.(focusType);

      // 자동 복원이 활성화된 경우 언마운트 시 복원
      if (autoRestore) {
        return () => {
          popFocus();
          onFocusChange?.('dashboard');
        };
      }
    }, [pushFocus, popFocus, focusType, autoRestore, onFocusChange]);

    // 포커스 변경 감지
    useEffect(() => {
      onFocusChange?.(currentFocus);
    }, [currentFocus, onFocusChange]);

    return <WrappedComponent {...props} />;
  };
}

// 모달 전용 데코레이터
export function withModalFocus<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: {
    autoRestore?: boolean;
    restoreOnClose?: boolean;
    onFocusChange?: (focus: FocusType) => void;
  }
) {
  return withFocusManagement(WrappedComponent, {
    focusType: 'modal',
    autoRestore: options?.autoRestore ?? true,
    restoreOnClose: options?.restoreOnClose ?? true,
    onFocusChange: options?.onFocusChange,
  });
}

// 서브페이지 전용 데코레이터
export function withSubPageFocus<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: {
    autoRestore?: boolean;
    restoreOnClose?: boolean;
    onFocusChange?: (focus: FocusType) => void;
  }
) {
  return withFocusManagement(WrappedComponent, {
    focusType: 'subpage',
    autoRestore: options?.autoRestore ?? true,
    restoreOnClose: options?.restoreOnClose ?? false,
    onFocusChange: options?.onFocusChange,
  });
}

// 오버레이 전용 데코레이터
export function withOverlayFocus<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: {
    autoRestore?: boolean;
    restoreOnClose?: boolean;
    onFocusChange?: (focus: FocusType) => void;
  }
) {
  return withFocusManagement(WrappedComponent, {
    focusType: 'overlay',
    autoRestore: options?.autoRestore ?? true,
    restoreOnClose: options?.restoreOnClose ?? true,
    onFocusChange: options?.onFocusChange,
  });
} 