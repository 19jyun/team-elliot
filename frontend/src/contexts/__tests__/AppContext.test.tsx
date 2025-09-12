// src/contexts/__tests__/AppContext.test.tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useApp } from '../AppContext';
import { SessionProvider } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { role: 'STUDENT' } },
    status: 'authenticated'
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Test component to access context
const TestComponent = () => {
  const app = useApp();
  return (
    <div>
      <div data-testid="active-tab">{app.activeTab}</div>
      <div data-testid="sub-page">{app.subPage || 'null'}</div>
      <div data-testid="can-go-back">{app.canGoBack ? 'true' : 'false'}</div>
      <div data-testid="navigation-items-count">{app.navigationItems.length}</div>
    </div>
  );
};

describe('AppContext', () => {
  it('should provide navigation context', () => {
    // Given
    render(
      <SessionProvider session={null}>
        <AppProvider>
          <TestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // Then
    expect(screen.getByTestId('active-tab')).toHaveTextContent('0');
    expect(screen.getByTestId('sub-page')).toHaveTextContent('null');
    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false');
    expect(screen.getByTestId('navigation-items-count')).toHaveTextContent('3'); // STUDENT navigation items
  });

  it('should provide form contexts', () => {
    // Given
    const FormTestComponent = () => {
      const app = useApp();
      return (
        <div>
          <div data-testid="enrollment-step">{app.forms.enrollment.state.currentStep}</div>
          <div data-testid="create-class-step">{app.forms.createClass.state.currentStep}</div>
          <div data-testid="auth-mode">{app.forms.auth.state.authMode}</div>
        </div>
      );
    };

    render(
      <SessionProvider session={null}>
        <AppProvider>
          <FormTestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // Then
    expect(screen.getByTestId('enrollment-step')).toHaveTextContent('main');
    expect(screen.getByTestId('create-class-step')).toHaveTextContent('info');
    expect(screen.getByTestId('auth-mode')).toHaveTextContent('login');
  });

  it('should provide UI context', () => {
    // Given
    const UITestComponent = () => {
      const app = useApp();
      return (
        <div>
          <div data-testid="notifications-count">{app.ui.notifications.length}</div>
          <div data-testid="modals-count">{app.ui.modals.length}</div>
        </div>
      );
    };

    render(
      <SessionProvider session={null}>
        <AppProvider>
          <UITestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // Then
    expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    expect(screen.getByTestId('modals-count')).toHaveTextContent('0');
  });

  it('should provide data context', () => {
    // Given
    const DataTestComponent = () => {
      const app = useApp();
      return (
        <div>
          <div data-testid="classes-count">{app.data.getAllData('classes').length}</div>
          <div data-testid="sessions-count">{app.data.getAllData('sessions').length}</div>
        </div>
      );
    };

    render(
      <SessionProvider session={null}>
        <AppProvider>
          <DataTestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // Then
    expect(screen.getByTestId('classes-count')).toHaveTextContent('0');
    expect(screen.getByTestId('sessions-count')).toHaveTextContent('0');
  });

  it('should provide legacy compatibility methods', () => {
    // Given
    const LegacyTestComponent = () => {
      const app = useApp();
      
      // Test legacy methods exist
      const hasSetEnrollmentStep = typeof app.setEnrollmentStep === 'function';
      const hasSetSelectedClasses = typeof app.setSelectedClasses === 'function';
      const hasResetEnrollment = typeof app.resetEnrollment === 'function';
      
      return (
        <div>
          <div data-testid="has-set-enrollment-step">{hasSetEnrollmentStep ? 'true' : 'false'}</div>
          <div data-testid="has-set-selected-classes">{hasSetSelectedClasses ? 'true' : 'false'}</div>
          <div data-testid="has-reset-enrollment">{hasResetEnrollment ? 'true' : 'false'}</div>
        </div>
      );
    };

    render(
      <SessionProvider session={null}>
        <AppProvider>
          <LegacyTestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // Then
    expect(screen.getByTestId('has-set-enrollment-step')).toHaveTextContent('true');
    expect(screen.getByTestId('has-set-selected-classes')).toHaveTextContent('true');
    expect(screen.getByTestId('has-reset-enrollment')).toHaveTextContent('true');
  });

  it('should handle navigation methods', async () => {
    // Given
    const NavigationTestComponent = () => {
      const app = useApp();
      const [result, setResult] = React.useState<string>('');

      const handleTest = async () => {
        try {
          await app.navigateToSubPage('enroll');
          setResult('navigate-success');
        } catch (_error) {
          setResult('navigate-error');
        }
      };

      return (
        <div>
          <button onClick={handleTest} data-testid="navigate-button">
            Navigate
          </button>
          <div data-testid="result">{result}</div>
        </div>
      );
    };

    render(
      <SessionProvider session={null}>
        <AppProvider>
          <NavigationTestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // When
    await act(async () => {
      screen.getByTestId('navigate-button').click();
    });

    // Then
    expect(screen.getByTestId('result')).toHaveTextContent('navigate-success');
  });

  it('should handle goBack method', async () => {
    // Given
    const GoBackTestComponent = () => {
      const app = useApp();
      const [result, setResult] = React.useState<string>('');

      const handleGoBack = async () => {
        try {
          const success = await app.goBack();
          setResult(success ? 'go-back-success' : 'go-back-failed');
        } catch (_error) {
          setResult('go-back-error');
        }
      };

      return (
        <div>
          <button onClick={handleGoBack} data-testid="go-back-button">
            Go Back
          </button>
          <div data-testid="result">{result}</div>
        </div>
      );
    };

    render(
      <SessionProvider session={null}>
        <AppProvider>
          <GoBackTestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // When
    await act(async () => {
      screen.getByTestId('go-back-button').click();
    });

    // Then
    expect(screen.getByTestId('result')).toHaveTextContent('go-back-failed'); // No history to go back
  });

  it('should throw error when used outside provider', () => {
    // Given
    const TestComponent = () => {
      useApp();
      return <div>Should not render</div>;
    };

    // Mock console.error to avoid test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // When & Then
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useApp must be used within an AppProvider');

    consoleSpy.mockRestore();
  });
});
