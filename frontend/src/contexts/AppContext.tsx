'use client';

import React, { ReactNode } from 'react';
import { NavigationProvider, useNavigation } from './NavigationContext';
import { FormProvider, useForm } from './FormContext';
import { UIProvider, useUI } from './UIContext';
import { DataProvider, useData } from './DataContext';

// 통합 AppProvider
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <FormProvider>
        <UIProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </UIProvider>
      </FormProvider>
    </NavigationProvider>
  );
}

// 통합 훅 - 모든 컨텍스트를 하나로 통합
export function useApp() {
  const navigation = useNavigation();
  const form = useForm();
  const ui = useUI();
  const data = useData();

  return {
    // 컨텍스트 객체들
    navigation,
    form,
    ui,
    data,
    
    // 네비게이션 관련 (하위 호환성을 위해)
    activeTab: navigation.activeTab,
    subPage: navigation.subPage,
    canGoBack: navigation.canGoBack,
    isTransitioning: navigation.isTransitioning,
    history: navigation.history,
    navigationItems: navigation.navigationItems,
    setActiveTab: navigation.setActiveTab,
    handleTabChange: navigation.handleTabChange,
    navigateToSubPage: navigation.navigateToSubPage,
    clearSubPage: navigation.clearSubPage,
    goBack: () => {
      // 단계별 뒤로가기 로직 (legacy DashboardContext와 동일)
      const { subPage } = navigation;
      const { enrollment, createClass, principalPersonManagement } = form;
      
      // 수강 변경 중인 경우 (modify-* 형태의 subPage) 단계별로 뒤로가기
      if (subPage && subPage.startsWith('modify-') && enrollment.currentStep !== 'date-selection') {
        const modificationStepOrder = ['date-selection', 'payment'];
        const currentIndex = modificationStepOrder.indexOf(enrollment.currentStep);
        const previousStep = currentIndex > 0 ? modificationStepOrder[currentIndex - 1] : 'date-selection';
        
        form.setEnrollmentStep(previousStep as 'date-selection' | 'payment');
        return;
      }
      
      // 수강신청 중인 경우 단계별로 뒤로가기
      if (subPage === 'enroll' && enrollment.currentStep !== 'academy-selection') {
        const stepOrder = ['academy-selection', 'class-selection', 'date-selection', 'payment', 'complete'];
        const currentIndex = stepOrder.indexOf(enrollment.currentStep);
        const previousStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : 'academy-selection';
        
        // class-selection에서 academy-selection으로 돌아갈 때 환불 동의 상태 초기화
        if (enrollment.currentStep === 'class-selection' && previousStep === 'academy-selection') {
          localStorage.removeItem('refundPolicyAgreed');
        }
        
        form.setEnrollmentStep(previousStep as 'academy-selection' | 'class-selection' | 'date-selection' | 'payment' | 'complete');
        return;
      }
      
      // 강의 개설 중인 경우 단계별로 뒤로가기
      if (subPage === 'create-class' && createClass.currentStep !== 'info') {
        const stepOrder = ['info', 'teacher', 'schedule', 'content', 'complete'];
        const currentIndex = stepOrder.indexOf(createClass.currentStep);
        const previousStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : 'info';
        
        form.setCreateClassStep(previousStep as 'info' | 'teacher' | 'schedule' | 'content' | 'complete');
        return;
      }
      
      // Principal 인원 관리 중인 경우 단계별로 뒤로가기
      if (subPage === 'person-management') {
        const { currentStep } = principalPersonManagement;
        switch (currentStep) {
          case 'request-detail':
            form.setPersonManagementStep('session-list');
            form.setSelectedRequestId(null);
            form.setSelectedRequestType(null);
            return;
          case 'session-list':
            form.setPersonManagementStep('class-list');
            form.setSelectedSessionId(null);
            form.setSelectedClassId(null);
            return;
          default:
            break;
        }
      }
      
      // 그 외의 경우 기본 네비게이션 goBack 사용
      navigation.goBack();
    },
    pushHistory: navigation.pushHistory,
    clearHistory: navigation.clearHistory,
    setTransitioning: navigation.setTransitioning,
    
    // 폼 상태 관련 (하위 호환성을 위해)
    enrollment: form.enrollment,
    createClass: form.createClass,
    principalCreateClass: form.principalCreateClass,
    auth: form.auth,
    personManagement: form.personManagement,
    
    // 수강신청 관련
    setEnrollmentStep: form.setEnrollmentStep,
    setSelectedMonth: form.setSelectedMonth,
    setSelectedClasses: form.setSelectedClasses,
    setSelectedSessions: form.setSelectedSessions,
    setSelectedClassIds: form.setSelectedClassIds,
    setSelectedAcademyId: form.setSelectedAcademyId,
    setSelectedClassesWithSessions: form.setSelectedClassesWithSessions,
    resetEnrollment: form.resetEnrollment,
    
    // 클래스 생성 관련
    setCreateClassStep: form.setCreateClassStep,
    setClassFormData: form.setClassFormData,
    setSelectedTeacherId: form.setSelectedTeacherId,
    resetCreateClass: form.resetCreateClass,
    
    // Principal 클래스 생성 관련
    setPrincipalCreateClass: form.setPrincipalCreateClass,
    setPrincipalCreateClassStep: form.setPrincipalCreateClassStep,
    setPrincipalClassFormData: form.setPrincipalClassFormData,
    setPrincipalSelectedTeacherId: form.setPrincipalSelectedTeacherId,
    resetPrincipalCreateClass: form.resetPrincipalCreateClass,
    
    // 인증 관련
    setAuthMode: form.setAuthMode,
    setAuthSubPage: form.setAuthSubPage,
    navigateToAuthSubPage: form.navigateToAuthSubPage,
    goBackFromAuth: form.goBackFromAuth,
    clearAuthSubPage: form.clearAuthSubPage,
    setSignupStep: form.setSignupStep,
    setRole: form.setRole,
    setPersonalInfo: form.setPersonalInfo,
    setAccountInfo: form.setAccountInfo,
    setTerms: form.setTerms,
    resetSignup: form.resetSignup,
    setLoginInfo: form.setLoginInfo,
    resetLogin: form.resetLogin,
    
    // 인원 관리 관련
    setPersonManagementStep: form.setPersonManagementStep,
    setPersonManagementTab: form.setPersonManagementTab,
    setSelectedClassId: form.setSelectedClassId,
    setSelectedSessionId: form.setSelectedSessionId,
    setSelectedRequestId: form.setSelectedRequestId,
    setSelectedRequestType: form.setSelectedRequestType,
    resetPersonManagement: form.resetPersonManagement,
    
    // 통합 폼 관리
    updateForm: form.updateForm,
    resetForm: form.resetForm,
    resetAllForms: form.resetAllForms,
    
    // UI 상태 관련
    modals: ui.modals,
    openModal: ui.openModal,
    closeModal: ui.closeModal,
    closeAllModals: ui.closeAllModals,
    loading: ui.loading,
    setLoading: ui.setLoading,
    isLoading: ui.isLoading,
    focus: ui.focus,
    currentFocus: ui.currentFocus,
    focusHistory: ui.focusHistory,
    isFocusTransitioning: ui.isFocusTransitioning,
    setFocus: ui.setFocus,
    pushFocus: ui.pushFocus,
    popFocus: ui.popFocus,
    isDashboardFocused: ui.isDashboardFocused,
    isModalFocused: ui.isModalFocused,
    isSubPageFocused: ui.isSubPageFocused,
    isOverlayFocused: ui.isOverlayFocused,
    clearFocusHistory: ui.clearFocusHistory,
    setFocusTransitioning: ui.setFocusTransitioning,
    notifications: ui.notifications,
    addNotification: ui.addNotification,
    removeNotification: ui.removeNotification,
    clearNotifications: ui.clearNotifications,
    resetUI: ui.resetUI,
    
    // 데이터 관련
    getData: data.getData,
    getAllData: data.getAllData,
    setData: data.setData,
    updateData: data.updateData,
    removeData: data.removeData,
    getCachedData: data.getCachedData,
    setCachedData: data.setCachedData,
    clearCache: data.clearCache,
    setDataLoading: data.setLoading,
    isDataLoading: data.isLoading,
    setDataError: data.setError,
    getDataError: data.getError,
    isDataStale: data.isDataStale,
    getLastUpdated: data.getLastUpdated,
    resetData: data.resetData,
    resetAllData: data.resetAllData,
    addOptimisticData: data.addOptimisticData,
    replaceOptimisticData: data.replaceOptimisticData,
    removeOptimisticData: data.removeOptimisticData,
  };
}
