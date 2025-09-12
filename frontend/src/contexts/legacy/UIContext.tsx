'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FocusType, ModalState, NotificationState, FocusState } from './types';

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
  
  // 포커스 관리 (기존 DashboardContext 기능)
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
  
  // 통합 UI 관리
  resetUI: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>({
    modals: [],
    loading: {},
    focus: { current: 'dashboard', history: ['dashboard'] },
    notifications: [],
    isFocusTransitioning: false,
  });

  // 모달 관리
  const openModal = useCallback((modal: Omit<ModalState, 'id'>) => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      modals: [...prev.modals, { ...modal, id }],
    }));
  }, []);

  const closeModal = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      modals: prev.modals.filter(modal => modal.id !== id),
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setState(prev => ({ ...prev, modals: [] }));
  }, []);

  // 로딩 관리
  const setLoading = useCallback((key: string, loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: loading },
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return state.loading[key] || false;
  }, [state.loading]);

  // 포커스 관리 (기존 DashboardContext 기능)
  const setFocus = useCallback((focus: FocusType) => {
    setState(prev => ({
      ...prev,
      focus: { ...prev.focus, current: focus },
    }));
  }, []);

  const pushFocus = useCallback((focus: FocusType) => {
    setState(prev => ({
      ...prev,
      focus: {
        current: focus,
        history: [...prev.focus.history, focus],
      },
    }));
  }, []);

  const popFocus = useCallback(() => {
    setState(prev => {
      if (prev.focus.history.length <= 1) return prev;
      const newHistory = [...prev.focus.history];
      newHistory.pop();
      return {
        ...prev,
        focus: {
          current: newHistory[newHistory.length - 1],
          history: newHistory,
        },
      };
    });
  }, []);

  const isDashboardFocused = useCallback(() => {
    return state.focus.current === 'dashboard';
  }, [state.focus]);

  const isModalFocused = useCallback(() => {
    return state.focus.current === 'modal';
  }, [state.focus]);

  const isSubPageFocused = useCallback(() => {
    return state.focus.current === 'subpage';
  }, [state.focus]);

  const isOverlayFocused = useCallback(() => {
    return state.focus.current === 'overlay';
  }, [state.focus]);

  const clearFocusHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      focus: { current: 'dashboard', history: ['dashboard'] },
    }));
  }, []);

  const setFocusTransitioning = useCallback((transitioning: boolean) => {
    setState(prev => ({
      ...prev,
      isFocusTransitioning: transitioning,
    }));
  }, []);

  // 알림 관리
  const addNotification = useCallback((notification: Omit<NotificationState, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { ...notification, id }],
    }));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notifications: [] }));
  }, []);

  // 통합 UI 관리
  const resetUI = useCallback(() => {
    setState({
      modals: [],
      loading: {},
      focus: { current: 'dashboard', history: ['dashboard'] },
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
    resetUI,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
