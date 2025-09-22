// src/contexts/__tests__/ImprovedNavigationContext.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { NavigationProvider, useNavigation } from '../navigation/NavigationContext';
import { StateSyncProvider } from '../state/StateSyncContext';
import { FormsState } from '../state/StateSyncTypes';

// StateSyncContext 모킹 - 무한 루프 방지
jest.mock('../state/StateSyncContext', () => ({
  StateSyncProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useStateSync: jest.fn(() => ({
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    getState: jest.fn(() => ({})),
    syncStates: jest.fn(),
    clearState: jest.fn(),
    clearAllStates: jest.fn(),
  })),
}));
// Mock SessionProvider
const mockSession = {
  data: {
    user: {
      role: 'STUDENT',
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
    expires: '2024-12-31T23:59:59.999Z',
  },
  status: 'authenticated',
  user: {
    role: 'STUDENT',
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: '2024-12-31T23:59:59.999Z',
};

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => mockSession,
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock forms state
const mockFormsState: FormsState = {
  enrollment: {
    currentStep: 'academy-selection',
    selectedMonth: null,
    selectedClasses: [],
    selectedSessions: [],
    selectedClassIds: [],
    selectedAcademyId: null,
    selectedClassesWithSessions: [],
  },
  createClass: {
    currentStep: 'info',
    classFormData: {
      name: '',
      description: '',
      level: 'BEGINNER' as const,
      maxStudents: 0,
      price: 0,
      content: '',
      schedule: {
        days: [],
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: '',
      },
    },
    selectedTeacherId: null,
  },
  auth: {
    authMode: 'login',
    authSubPage: null,
    signup: {
      step: 'role-selection',
      role: 'STUDENT',
      personalInfo: {
        name: '',
        phoneNumber: '',
      },
      accountInfo: {
        userId: '',
        password: '',
        confirmPassword: '',
      },
      terms: {
        age: false,
        terms1: false,
        terms2: false,
        marketing: false,
      },
    },
    login: {
      userId: '',
      password: '',
    },
  },
  personManagement: {
    currentStep: 'class-list',
    selectedTab: 'enrollment',
    selectedClassId: null,
    selectedSessionId: null,
    selectedRequestId: null,
    selectedRequestType: null,
  },
  principalCreateClass: {
    currentStep: 'info',
    classFormData: {
      name: '',
      description: '',
      maxStudents: 0,
      price: 0,
      startDate: '',
      endDate: '',
      schedule: [],
    },
    selectedTeacherId: null,
  },
  principalPersonManagement: {
    currentStep: 'class-list',
    selectedTab: 'enrollment',
    selectedClassId: null,
    selectedSessionId: null,
    selectedRequestId: null,
    selectedRequestType: null,
  },
};

// Test component
const TestComponent = () => {
  const navigation = useNavigation();
  const [result, setResult] = React.useState<string>('');

  const handleGoBack = async () => {
    try {
      const success = await navigation.goBack();
      setResult(success ? 'go-back-success' : 'go-back-failed');
    } catch (_error) {
      setResult('go-back-error');
    }
  };

  const handleGoBackWithForms = async () => {
    try {
      const success = await navigation.goBackWithForms(mockFormsState);
      setResult(success ? 'go-back-with-forms-success' : 'go-back-with-forms-failed');
    } catch (_error) {
      setResult('go-back-with-forms-error');
    }
  };

  const handleTabChange = () => {
    navigation.handleTabChange(1);
    setResult('tab-changed');
  };

  const handleNavigateToSubPage = () => {
    navigation.navigateToSubPage('enroll');
    setResult('subpage-navigated');
  };

  const handleClearSubPage = () => {
    navigation.clearSubPage();
    setResult('subpage-cleared');
  };

  const handlePushHistory = () => {
    navigation.pushHistory({
      id: 'test-history',
      timestamp: Date.now(),
      type: 'navigation',
      data: { test: 'data' },
    });
    setResult('history-pushed');
  };

  const handlePushSubpageHistory = () => {
    navigation.pushHistory({
      id: 'test-subpage-history',
      timestamp: Date.now(),
      type: 'subpage',
      data: { test: 'subpage-data' },
    });
    setResult('subpage-history-pushed');
  };

  return (
    <div>
      <button onClick={handleGoBack} data-testid="go-back-button">
        Go Back
      </button>
      <button onClick={handleGoBackWithForms} data-testid="go-back-with-forms-button">
        Go Back With Forms
      </button>
      <button onClick={handleTabChange} data-testid="tab-change-button">
        Change Tab
      </button>
      <button onClick={handleNavigateToSubPage} data-testid="navigate-subpage-button">
        Navigate to SubPage
      </button>
      <button onClick={handleClearSubPage} data-testid="clear-subpage-button">
        Clear SubPage
      </button>
      <button onClick={handlePushHistory} data-testid="push-history-button">
        Push History
      </button>
      <button onClick={handlePushSubpageHistory} data-testid="push-subpage-history-button">
        Push Subpage History
      </button>
      <div data-testid="result">{result}</div>
      <div data-testid="active-tab">{navigation.activeTab}</div>
      <div data-testid="sub-page">{navigation.subPage || 'null'}</div>
      <div data-testid="can-go-back">{navigation.canGoBack ? 'true' : 'false'}</div>
      <div data-testid="is-transitioning">{navigation.isTransitioning ? 'true' : 'false'}</div>
      <div data-testid="navigation-items-count">{navigation.navigationItems.length}</div>
      <div data-testid="history-count">{navigation.history.length}</div>
    </div>
  );
};

describe('ImprovedNavigationContext', () => {
  it('should provide navigation context', () => {
    render(
      <SessionProvider session={mockSession}>
        <StateSyncProvider>
          <NavigationProvider formsState={mockFormsState}>
            <TestComponent />
          </NavigationProvider>
        </StateSyncProvider>
      </SessionProvider>
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('0');
    expect(screen.getByTestId('sub-page')).toHaveTextContent('null');
    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false');
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false');
    expect(screen.getByTestId('navigation-items-count')).toHaveTextContent('3'); // STUDENT role
  });

  it('should handle tab changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <StateSyncProvider>
          <NavigationProvider formsState={mockFormsState}>
            <TestComponent />
          </NavigationProvider>
        </StateSyncProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('tab-change-button'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('tab-changed');
      expect(screen.getByTestId('active-tab')).toHaveTextContent('1');
    });
  });

  it('should handle subpage navigation', async () => {
    render(
      <SessionProvider session={mockSession}>
        <StateSyncProvider>
          <NavigationProvider formsState={mockFormsState}>
            <TestComponent />
          </NavigationProvider>
        </StateSyncProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('navigate-subpage-button'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('subpage-navigated');
      expect(screen.getByTestId('sub-page')).toHaveTextContent('enroll');
    });
  });

  it('should handle subpage clearing', async () => {
    render(
      <SessionProvider session={mockSession}>
        <StateSyncProvider>
          <NavigationProvider formsState={mockFormsState}>
            <TestComponent />
          </NavigationProvider>
        </StateSyncProvider>
      </SessionProvider>
    );

    // First navigate to subpage
    fireEvent.click(screen.getByTestId('navigate-subpage-button'));

    await waitFor(() => {
      expect(screen.getByTestId('sub-page')).toHaveTextContent('enroll');
    });

    // Then clear it
    fireEvent.click(screen.getByTestId('clear-subpage-button'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('subpage-cleared');
      expect(screen.getByTestId('sub-page')).toHaveTextContent('null');
    });
  });

  it('should handle history operations', async () => {
    render(
      <SessionProvider session={mockSession}>
        <StateSyncProvider>
          <NavigationProvider formsState={mockFormsState}>
            <TestComponent />
          </NavigationProvider>
        </StateSyncProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('push-history-button'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('history-pushed');
      // navigation 타입은 더 이상 virtual history에 추가되지 않으므로 history-count는 0
      expect(screen.getByTestId('history-count')).toHaveTextContent('0');
    });
  });

  it('should handle subpage history operations', async () => {
    render(
      <SessionProvider session={mockSession}>
        <StateSyncProvider>
          <NavigationProvider formsState={mockFormsState}>
            <TestComponent />
          </NavigationProvider>
        </StateSyncProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('push-subpage-history-button'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('subpage-history-pushed');
      // subpage 타입은 virtual history에 추가되므로 history-count는 1
      expect(screen.getByTestId('history-count')).toHaveTextContent('1');
    });
  });

  it('should handle goBack with forms', async () => {
    render(
      <SessionProvider session={mockSession}>
        <StateSyncProvider>
          <NavigationProvider formsState={mockFormsState}>
            <TestComponent />
          </NavigationProvider>
        </StateSyncProvider>
      </SessionProvider>
    );

    // First navigate to subpage
    fireEvent.click(screen.getByTestId('navigate-subpage-button'));

    await waitFor(() => {
      expect(screen.getByTestId('sub-page')).toHaveTextContent('enroll');
    });

    // Then try to go back with forms
    fireEvent.click(screen.getByTestId('go-back-with-forms-button'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('go-back-with-forms-success');
    });
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNavigation must be used within an NavigationProvider');

    consoleSpy.mockRestore();
  });

  it('should handle different user roles', () => {
    const teacherSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: 'TEACHER',
        },
      },
    };

    render(
      <SessionProvider session={teacherSession}>
        <StateSyncProvider>
          <NavigationProvider formsState={mockFormsState}>
            <TestComponent />
          </NavigationProvider>
        </StateSyncProvider>
      </SessionProvider>
    );

    expect(screen.getByTestId('navigation-items-count')).toHaveTextContent('3'); // TEACHER role
  });
});
