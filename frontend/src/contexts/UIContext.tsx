// src/contexts/UIContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// 타입 정의
export type FocusType = 'dashboard' | 'modal' | 'subpage' | 'overlay';

export interface ModalState {
  id: string;
  type: string;
  title?: string;
  content?: ReactNode;
  onClose?: () => void;
  closable?: boolean;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface FocusState {
  current: FocusType;
  history: FocusType[];
  isTransitioning: boolean;
}

interface UIState {
  modals: ModalState[];
  loading: Record<string, boolean>;
  focus: FocusState;
  notifications: NotificationState[];
  isFocusTransitioning: boolean;
}

interface UIContextType {
  // 모달 관리
  modals: ModalState[];
  openModal: (modal: Omit<ModalState, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // 로딩 관리
  loading: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  
  // 포커스 관리
  focus: FocusState;
  currentFocus: FocusType;
  focusHistory: FocusType[];
  isFocusTransitioning: boolean;
  setFocus: (focus: FocusType) => void;
  pushFocus: (focus: FocusType) => void;
  popFocus: () => void;
  isDashboardFocused: () => boolean;
  isModalFocused: () => boolean;
  isSubPageFocused: () => boolean;
  isOverlayFocused: () => boolean;
  clearFocusHistory: () => void;
  setFocusTransitioning: (transitioning: boolean) => void;
  
  // 알림 관리
  notifications: NotificationState[];
  addNotification: (notification: Omit<NotificationState, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // 에러 처리 및 복구
  showError: (message: string, options?: { 
    title?: string; 
    duration?: number; 
    onRetry?: () => void; 
    onDismiss?: () => void;
  }) => void;
  showSuccess: (message: string, options?: { 
    title?: string; 
    duration?: number; 
  }) => void;
  showWarning: (message: string, options?: { 
    title?: string; 
    duration?: number; 
  }) => void;
  showInfo: (message: string, options?: { 
    title?: string; 
    duration?: number; 
  }) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // 통합 UI 관리
  resetUI: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIContextProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, setState] = useState<UIState>({
    modals: [],
    loading: {},
    focus: {
      current: 'dashboard',
      history: ['dashboard'],
      isTransitioning: false,
    },
    notifications: [],
    isFocusTransitioning: false,
  });

  // 모달 관리
  const openModal = useCallback((modal: Omit<ModalState, 'id'>) => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newModal: ModalState = { ...modal, id };
    
    setState(prev => ({
      ...prev,
      modals: [...prev.modals, newModal],
    }));
  }, []);

  const closeModal = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      modals: prev.modals.filter(modal => modal.id !== id),
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setState(prev => ({
      ...prev,
      modals: [],
    }));
  }, []);

  // 로딩 관리
  const setLoading = useCallback((key: string, loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        [key]: loading,
      },
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return state.loading[key] || false;
  }, [state.loading]);

  // 포커스 관리
  const setFocus = useCallback((focus: FocusType) => {
    setState(prev => ({
      ...prev,
      focus: {
        current: focus,
        history: [...prev.focus.history, focus],
        isTransitioning: false,
      },
      isFocusTransitioning: false,
    }));
  }, []);

  const pushFocus = useCallback((focus: FocusType) => {
    setState(prev => ({
      ...prev,
      focus: {
        current: focus,
        history: [...prev.focus.history, focus],
        isTransitioning: true,
      },
      isFocusTransitioning: true,
    }));
  }, []);

  const popFocus = useCallback(() => {
    setState(prev => {
      if (prev.focus.history.length <= 1) return prev;
      
      const newHistory = [...prev.focus.history];
      newHistory.pop();
      const newCurrent = newHistory[newHistory.length - 1];
      
      return {
        ...prev,
        focus: {
          current: newCurrent,
          history: newHistory,
          isTransitioning: true,
        },
        isFocusTransitioning: true,
      };
    });
  }, []);

  const isDashboardFocused = useCallback(() => {
    return state.focus.current === 'dashboard';
  }, [state.focus.current]);

  const isModalFocused = useCallback(() => {
    return state.focus.current === 'modal';
  }, [state.focus.current]);

  const isSubPageFocused = useCallback(() => {
    return state.focus.current === 'subpage';
  }, [state.focus.current]);

  const isOverlayFocused = useCallback(() => {
    return state.focus.current === 'overlay';
  }, [state.focus.current]);

  const clearFocusHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      focus: {
        current: 'dashboard',
        history: ['dashboard'],
        isTransitioning: false,
      },
      isFocusTransitioning: false,
    }));
  }, []);

  const setFocusTransitioning = useCallback((transitioning: boolean) => {
    setState(prev => ({
      ...prev,
      focus: {
        ...prev.focus,
        isTransitioning: transitioning,
      },
      isFocusTransitioning: transitioning,
    }));
  }, []);

  // 알림 관리
  const addNotification = useCallback((notification: Omit<NotificationState, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationState = { ...notification, id };
    
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification],
    }));

    // 자동 제거 (기본 5초)
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notification => notification.id !== id),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
    }));
  }, []);

  // 에러 처리 및 복구 메서드들
  const showError = useCallback((message: string, options?: { 
    title?: string; 
    duration?: number; 
    onRetry?: () => void; 
    onDismiss?: () => void;
  }) => {
    const notification: Omit<NotificationState, 'id'> = {
      type: 'error',
      title: options?.title || '오류',
      message,
      duration: options?.duration || 0, // 에러는 수동으로 닫아야 함
      action: options?.onRetry ? {
        label: '다시 시도',
        onClick: options.onRetry,
      } : undefined,
    };
    
    addNotification(notification);
    
    // onDismiss 콜백이 있으면 알림이 제거될 때 호출
    if (options?.onDismiss) {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setTimeout(() => {
        options.onDismiss?.();
      }, 100);
    }
  }, [addNotification]);

  const showSuccess = useCallback((message: string, options?: { 
    title?: string; 
    duration?: number; 
  }) => {
    addNotification({
      type: 'success',
      title: options?.title || '성공',
      message,
      duration: options?.duration || 3000,
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string, options?: { 
    title?: string; 
    duration?: number; 
  }) => {
    addNotification({
      type: 'warning',
      title: options?.title || '경고',
      message,
      duration: options?.duration || 4000,
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, options?: { 
    title?: string; 
    duration?: number; 
  }) => {
    addNotification({
      type: 'info',
      title: options?.title || '알림',
      message,
      duration: options?.duration || 3000,
    });
  }, [addNotification]);

  const clearNotification = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  const clearAllNotifications = useCallback(() => {
    clearNotifications();
  }, [clearNotifications]);

  // 통합 UI 관리
  const resetUI = useCallback(() => {
    setState({
      modals: [],
      loading: {},
      focus: {
        current: 'dashboard',
        history: ['dashboard'],
        isTransitioning: false,
      },
      notifications: [],
      isFocusTransitioning: false,
    });
  }, []);

  const value: UIContextType = {
    modals: state.modals,
    openModal,
    closeModal,
    closeAllModals,
    loading: state.loading,
    setLoading,
    isLoading,
    focus: state.focus,
    currentFocus: state.focus.current,
    focusHistory: state.focus.history,
    isFocusTransitioning: state.isFocusTransitioning,
    setFocus,
    pushFocus,
    popFocus,
    isDashboardFocused,
    isModalFocused,
    isSubPageFocused,
    isOverlayFocused,
    clearFocusHistory,
    setFocusTransitioning,
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearNotification,
    clearAllNotifications,
    resetUI,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};
