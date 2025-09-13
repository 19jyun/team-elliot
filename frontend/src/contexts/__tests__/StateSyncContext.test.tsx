// src/contexts/__tests__/StateSyncContext.test.tsx
import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { StateSyncProvider, useStateSync } from '../state/StateSyncContext';
import { NavigationState, FormsState } from '../state/StateSyncTypes';

// Test component
const TestComponent = () => {
  const stateSync = useStateSync();
  const [result, setResult] = React.useState<string>('');

  const handlePublishNavigation = () => {
    const navigationState: NavigationState = {
      activeTab: 1,
      subPage: 'test',
      canGoBack: true,
      isTransitioning: false,
      navigationItems: [],
      history: [],
    };
    stateSync.publish('navigation', navigationState);
    setResult('navigation-published');
  };

  const handlePublishForms = () => {
    const formsState: FormsState = {
      enrollment: {
        currentStep: 'class-selection',
        selectedMonth: null,
        selectedClasses: [],
        selectedSessions: [],
        selectedClassIds: [],
        selectedAcademyId: 123,
        selectedClassesWithSessions: [],
      },
      createClass: {
        currentStep: 'info',
        classFormData: {} as any,
        selectedTeacherId: null,
      },
      auth: {
        authMode: 'login',
        authSubPage: null,
        signup: {
          step: 'role-selection',
          role: 'STUDENT',
          personalInfo: {} as any,
          accountInfo: {} as any,
          terms: {} as any,
        },
        login: {} as any,
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
        classFormData: {} as any,
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
    stateSync.publish('forms', formsState);
    setResult('forms-published');
  };

  const handleGetNavigation = () => {
    const navState = stateSync.getState('navigation');
    setResult(navState ? 'navigation-retrieved' : 'navigation-null');
  };

  const handleGetForms = () => {
    const formsState = stateSync.getState('forms');
    setResult(formsState ? 'forms-retrieved' : 'forms-null');
  };

  const handleSyncStates = () => {
    stateSync.syncStates({
      navigation: {
        activeTab: 2,
        subPage: null,
        canGoBack: false,
        isTransitioning: false,
        navigationItems: [],
        history: [],
      },
    });
    setResult('states-synced');
  };

  return (
    <div>
      <button onClick={handlePublishNavigation} data-testid="publish-navigation-button">
        Publish Navigation
      </button>
      <button onClick={handlePublishForms} data-testid="publish-forms-button">
        Publish Forms
      </button>
      <button onClick={handleGetNavigation} data-testid="get-navigation-button">
        Get Navigation
      </button>
      <button onClick={handleGetForms} data-testid="get-forms-button">
        Get Forms
      </button>
      <button onClick={handleSyncStates} data-testid="sync-states-button">
        Sync States
      </button>
      <div data-testid="result">{result}</div>
    </div>
  );
};

// Subscription test component
const SubscriptionTestComponent = () => {
  const stateSync = useStateSync();
  const [navigationData, setNavigationData] = React.useState<any>(null);
  const [formsData, setFormsData] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribeNav = stateSync.subscribe('navigation', (data) => {
      setNavigationData(data);
    });

    const unsubscribeForms = stateSync.subscribe('forms', (data) => {
      setFormsData(data);
    });

    return () => {
      unsubscribeNav();
      unsubscribeForms();
    };
  }, [stateSync]);

  return (
    <div>
      <div data-testid="navigation-data">
        {navigationData ? JSON.stringify(navigationData) : 'null'}
      </div>
      <div data-testid="forms-data">
        {formsData ? JSON.stringify(formsData) : 'null'}
      </div>
    </div>
  );
};

describe('StateSyncContext', () => {
  it('should provide state sync context', () => {
    render(
      <StateSyncProvider>
        <TestComponent />
      </StateSyncProvider>
    );

    expect(screen.getByTestId('publish-navigation-button')).toBeInTheDocument();
    expect(screen.getByTestId('publish-forms-button')).toBeInTheDocument();
  });

  it('should publish and retrieve navigation state', async () => {
    render(
      <StateSyncProvider>
        <TestComponent />
      </StateSyncProvider>
    );

    // Publish navigation state
    fireEvent.click(screen.getByTestId('publish-navigation-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('navigation-published');
    });

    // Retrieve navigation state
    fireEvent.click(screen.getByTestId('get-navigation-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('navigation-retrieved');
    });
  });

  it('should publish and retrieve forms state', async () => {
    render(
      <StateSyncProvider>
        <TestComponent />
      </StateSyncProvider>
    );

    // Publish forms state
    fireEvent.click(screen.getByTestId('publish-forms-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('forms-published');
    });

    // Retrieve forms state
    fireEvent.click(screen.getByTestId('get-forms-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('forms-retrieved');
    });
  });

  it('should sync multiple states', async () => {
    render(
      <StateSyncProvider>
        <TestComponent />
      </StateSyncProvider>
    );

    fireEvent.click(screen.getByTestId('sync-states-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('states-synced');
    });
  });

  it('should handle subscriptions', async () => {
    render(
      <StateSyncProvider>
        <div>
          <TestComponent />
          <SubscriptionTestComponent />
        </div>
      </StateSyncProvider>
    );

    // Initially no data
    expect(screen.getByTestId('navigation-data')).toHaveTextContent('null');
    expect(screen.getByTestId('forms-data')).toHaveTextContent('null');

    // Publish navigation state
    fireEvent.click(screen.getByTestId('publish-navigation-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('navigation-data')).not.toHaveTextContent('null');
    });

    // Publish forms state
    fireEvent.click(screen.getByTestId('publish-forms-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('forms-data')).toHaveTextContent('enrollment');
    });
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useStateSync must be used within a StateSyncProvider');

    consoleSpy.mockRestore();
  });

  it('should handle multiple subscribers', async () => {
    const MultipleSubscribersComponent = () => {
      const stateSync = useStateSync();
      const [count, setCount] = React.useState(0);

      React.useEffect(() => {
        const unsubscribe1 = stateSync.subscribe('navigation', () => {
          setCount(prev => prev + 1);
        });

        const unsubscribe2 = stateSync.subscribe('navigation', () => {
          setCount(prev => prev + 1);
        });

        return () => {
          unsubscribe1();
          unsubscribe2();
        };
      }, [stateSync]);

      return <div data-testid="subscriber-count">{count}</div>;
    };

    render(
      <StateSyncProvider>
        <div>
          <TestComponent />
          <MultipleSubscribersComponent />
        </div>
      </StateSyncProvider>
    );

    // Publish navigation state - should trigger both subscribers
    fireEvent.click(screen.getByTestId('publish-navigation-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subscriber-count')).toHaveTextContent('2');
    });
  });
});
