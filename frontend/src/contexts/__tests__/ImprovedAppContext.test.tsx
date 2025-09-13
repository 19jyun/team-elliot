// src/contexts/__tests__/ImprovedAppContext.test.tsx
import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { ImprovedAppProvider, useImprovedApp } from '../ImprovedAppContext';


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

// Test component
const TestComponent = () => {
  const app = useImprovedApp();
  const [result, setResult] = React.useState<string>('');

  const handleGoBack = async () => {
    try {
      const success = await app.goBack();
      setResult(success ? 'go-back-success' : 'go-back-failed');
    } catch (error) {
      setResult('go-back-error');
    }
  };

  const handleEnrollmentStep = () => {
    app.setEnrollmentStep('class-selection');
    setResult('enrollment-step-changed');
  };

  const handleEnrollmentData = () => {
    app.setSelectedAcademyId(123);
    setResult('enrollment-data-changed');
  };

  const handleNavigateToSubPage = () => {
    app.navigateToSubPage('enroll');
    setResult('subpage-navigated');
  };

  const handleCreateClassStep = () => {
    app.setCreateClassStep('teacher');
    setResult('create-class-step-changed');
  };

  const handleAuthMode = () => {
    app.setAuthMode('signup');
    setResult('auth-mode-changed');
  };

  return (
    <div>
      <button onClick={handleGoBack} data-testid="go-back-button">
        Go Back
      </button>
      <button onClick={handleEnrollmentStep} data-testid="enrollment-step-button">
        Change Enrollment Step
      </button>
      <button onClick={handleEnrollmentData} data-testid="enrollment-data-button">
        Change Enrollment Data
      </button>
      <button onClick={handleCreateClassStep} data-testid="create-class-step-button">
        Change Create Class Step
      </button>
      <button onClick={handleAuthMode} data-testid="auth-mode-button">
        Change Auth Mode
      </button>
      <button onClick={handleNavigateToSubPage} data-testid="navigate-subpage-button">
        Navigate to SubPage
      </button>
      <div data-testid="result">{result}</div>
      <div data-testid="active-tab">{app.activeTab}</div>
      <div data-testid="sub-page">{app.subPage || 'null'}</div>
      <div data-testid="can-go-back">{app.canGoBack ? 'true' : 'false'}</div>
      <div data-testid="enrollment-step">{app.form.enrollment.currentStep}</div>
      <div data-testid="enrollment-academy-id">{app.form.enrollment.selectedAcademyId || 'null'}</div>
      <div data-testid="create-class-step">{app.form.createClass.currentStep}</div>
      <div data-testid="auth-mode">{app.form.auth.authMode}</div>
    </div>
  );
};

describe('ImprovedAppContext', () => {
  it('should provide navigation context', () => {
    render(
      <SessionProvider session={mockSession}>
        <ImprovedAppProvider>
          <TestComponent />
        </ImprovedAppProvider>
      </SessionProvider>
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('0');
    expect(screen.getByTestId('sub-page')).toHaveTextContent('null');
    expect(screen.getByTestId('can-go-back')).toHaveTextContent('false');
  });

  it('should handle navigation changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <ImprovedAppProvider>
          <TestComponent />
        </ImprovedAppProvider>
      </SessionProvider>
    );

    // Navigate to subpage
    fireEvent.click(screen.getByTestId('navigate-subpage-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('subpage-navigated');
      expect(screen.getByTestId('sub-page')).toHaveTextContent('enroll');
    });
  });

  it('should handle enrollment form state changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <ImprovedAppProvider>
          <TestComponent />
        </ImprovedAppProvider>
      </SessionProvider>
    );

    // Change enrollment step
    fireEvent.click(screen.getByTestId('enrollment-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('enrollment-step-changed');
      expect(screen.getByTestId('enrollment-step')).toHaveTextContent('class-selection');
    });

    // Change enrollment data
    fireEvent.click(screen.getByTestId('enrollment-data-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('enrollment-data-changed');
      expect(screen.getByTestId('enrollment-academy-id')).toHaveTextContent('123');
    });
  });

  it('should handle create class form state changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <ImprovedAppProvider>
          <TestComponent />
        </ImprovedAppProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('create-class-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('create-class-step-changed');
      expect(screen.getByTestId('create-class-step')).toHaveTextContent('teacher');
    });
  });

  it('should handle auth form state changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <ImprovedAppProvider>
          <TestComponent />
        </ImprovedAppProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('auth-mode-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('auth-mode-changed');
      expect(screen.getByTestId('auth-mode')).toHaveTextContent('signup');
    });
  });

  it('should handle goBack method', async () => {
    render(
      <SessionProvider session={mockSession}>
        <ImprovedAppProvider>
          <TestComponent />
        </ImprovedAppProvider>
      </SessionProvider>
    );

    // First navigate to subpage
    fireEvent.click(screen.getByTestId('navigate-subpage-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('sub-page')).toHaveTextContent('enroll');
    });

    // Then try to go back
    fireEvent.click(screen.getByTestId('go-back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('go-back-success');
      expect(screen.getByTestId('sub-page')).toHaveTextContent('null');
    });
  });

  it('should throw error when used outside provider', () => {
    // Mock console.error to avoid test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // When & Then
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useImprovedApp must be used within an ImprovedAppProvider');

    consoleSpy.mockRestore();
  });

  it('should maintain state synchronization between contexts', async () => {
    render(
      <SessionProvider session={mockSession}>
        <ImprovedAppProvider>
          <TestComponent />
        </ImprovedAppProvider>
      </SessionProvider>
    );

    // Change enrollment step
    fireEvent.click(screen.getByTestId('enrollment-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('enrollment-step')).toHaveTextContent('class-selection');
    });

    // Navigate to subpage
    fireEvent.click(screen.getByTestId('navigate-subpage-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('sub-page')).toHaveTextContent('enroll');
    });

    // Go back should work correctly
    fireEvent.click(screen.getByTestId('go-back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('go-back-success');
    });

    // The goBack should work - just check that the result is success
    expect(screen.getByTestId('result')).toHaveTextContent('go-back-success');
  });
});
