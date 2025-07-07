'use client';

import React, { ComponentType } from 'react';
import { useFocusManager, FocusType } from '@/hooks/useFocusManager';

interface WithFocusManagerProps {
  focusType: FocusType;
  autoRestore?: boolean;
  restoreOnClose?: boolean;
}

export function withFocusManager<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithFocusManagerProps
) {
  const { focusType, autoRestore = true, restoreOnClose = true } = options;

  return function FocusManagedComponent(props: P) {
    const { setCurrentFocus, restoreFocus } = useFocusManager({
      focusType,
      autoRestore,
      restoreOnClose,
    });

    // 포커스 관리 기능을 props로 전달
    const enhancedProps = {
      ...props,
      setCurrentFocus,
      restoreFocus,
    } as P & {
      setCurrentFocus: () => void;
      restoreFocus: () => void;
    };

    return <WrappedComponent {...enhancedProps} />;
  };
}

// 모달 전용 HOC
export function withModalFocus<P extends object>(WrappedComponent: ComponentType<P>) {
  return withFocusManager(WrappedComponent, {
    focusType: 'modal',
    autoRestore: true,
    restoreOnClose: true,
  });
}

// 서브페이지 전용 HOC
export function withSubPageFocus<P extends object>(WrappedComponent: ComponentType<P>) {
  return withFocusManager(WrappedComponent, {
    focusType: 'subpage',
    autoRestore: true,
    restoreOnClose: false,
  });
}

// 오버레이 전용 HOC
export function withOverlayFocus<P extends object>(WrappedComponent: ComponentType<P>) {
  return withFocusManager(WrappedComponent, {
    focusType: 'overlay',
    autoRestore: true,
    restoreOnClose: true,
  });
} 